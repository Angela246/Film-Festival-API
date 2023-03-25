import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import fs from "mz/fs";

const viewAllFilm = async(query:any) : Promise<any> =>{
    Logger.info ("Getting all film from the database");
    const conn = await getPool().getConnection();
    let filmQuery='select film.id as filmId, film.title, film.genre_id as genreId, film.age_rating as ' +
        'ageRating, film.director_id as directorId, user.first_name as directorFirstName,user.last_name as directorLastName, ' +
        '(select avg(rating) from film_review where film_review.film_id = film.id) as rating,film.release_date ' +
        'as releaseDate from film join film_review on film.id = film_review.film_id join user on film.director_id = user.id'

    const [result] = await conn.query(query);
    Logger.info(`Viewing user with id: ${result[0].genre_id}`)

    if (query.directorId !== undefined ||query.reviewerId!==undefined||query.sortBy!==undefined||query.genreId!==undefined||query.q!==undefined){
        filmQuery+= 'where';
    }
    if (query.directorId!==undefined){
        filmQuery+= `(film.director_id = ${query.directorId}) and `
    }
    if (query.reviewerId!==undefined){
        filmQuery +=`(film_review.user_id =${query.reviewerId}) and `
    }
    if (query.genreId!==undefined){
        filmQuery+='(film.genre_id = ' + query.genreId
    }
    if (query.q!== undefined) {
        if (!(filmQuery.endsWith('AND'))) {
            filmQuery += 'and';
        }
        filmQuery+=`title like %${query.q}% or description like %${query.q}% and `
    }
    if (filmQuery.endsWith('AND ')){
        filmQuery = filmQuery.slice(0,-4);
    }
    const sortMapping = {
        ALPHABETICAL_ASC: "title ASC",
        ALPHABETICAL_DESC: "title DESC",
        RELEASED_ASC: "release_date ASC",
        RELEASED_DESC: "release_date DESC",
        RATING_ASC: "rating ASC",
        RATING_DESC: "rating DESC",
    }
    filmQuery += 'GROUP by film.id ';
    filmQuery+='sort by ' + query.sortBy;

}

const getFilm = async(id:string): Promise<any>=>{
    const conn = await getPool().getConnection();
    Logger.info(`Reach this part? ${id}`);
    let query = 'select * from film where id=?'
    const[filmInfo] = await conn.query(query,[parseInt(id,10)]);
    if (filmInfo[0]===undefined){
        return 404;
    }
    query = 'select user.first_name, user.last_name from user where id=?'
    const[directorInfo]= await conn.query(query,[filmInfo[0].director_id])

    query ='select count(*) as numReview,round(avg(rating),1) as ratingAverage from film_review where film_id =?'
    const[reviewCount]= await conn.query(query, [id]);
    if (reviewCount[0].ratingAverage==null){
        reviewCount[0].ratingAverage=0;
    }
    Logger.http (`Reach this part? ${reviewCount[0].ratingAverage}`)
    return {filmId:filmInfo[0].id, title: filmInfo[0].title, genreId: filmInfo[0].genre_id, ageRating:filmInfo[0].age_rating, directorId:filmInfo[0].director_id, directorFirstName:directorInfo[0].first_name, directorLastName:directorInfo[0].last_name,rating:parseFloat(reviewCount[0].ratingAverage), releaseDate:filmInfo[0].release_date, description:filmInfo[0].description, runtime: filmInfo[0].runtime, numReviews:reviewCount[0].numReview }

}

const getGenre= async ()=>{
    const conn = await getPool().getConnection();
    const [result]= await conn.query('select id as genreId,name from genre');
    return result;
}

// TODO add own validation for release date

const addFilm= async(token:string, body:any): Promise<any>=>{
    const conn = await getPool().getConnection();
    if (body.age_rating==null){
        body.age_rating='TBC';
    }
    if (!body.releaseDate){
        body.releaseDate= Date.now();
    }
    if (!body.runtime){
        body.runtime=null;
    }
    let query = 'select * from genre where id =?'
    const[genreIdResult]= await conn.query(query, [body.genreId]);
    if (genreIdResult[0]===undefined){
        return 400;
    }
    if (Date.now()>new Date(body.releaseDate).getTime()){
        return 403;
    }
    query= 'select * from film where title =?'
    const[titleExist] = await conn.query(query,[body.title]);
    if (titleExist[0]!==undefined){
        return 403;
    }
    query= 'select * from user where auth_token = ?'
    const[authorizeUser] = await conn.query(query, [token]);

    if (authorizeUser[0]===undefined){
        return 401;
    }
    query='insert into film  (title, description,release_date,runtime,genre_id, age_rating, director_id ) values(?,?,?,?,?,?,?)'
    const[insertFilm] = await conn.query(query, [body.title,body.description, body.releaseDate, body.runtime,body.genreId,body.ageRating,authorizeUser[0].id]);
    return insertFilm.insertId;

}
const editFilm = async(token:string, body:any, id:string): Promise <any> =>{
    Logger.http(`token is ${token}`)
    if (!token){
        return 401;
    }
    const conn = await getPool().getConnection();
    let query = 'select * from film join (select id, auth_token from user) as U on film.director_id= U.id where film.id =?'
    const [filmAuthorization] = await conn.query(query, id);
    if (!filmAuthorization[0]){
        return 404;
    }
    else if (filmAuthorization[0].auth_token!==token){
        Logger.http ('unauthorised')
        return 403;
    }

    if (body.genreId){
        query = 'select * from genre where id=?'
        const[genreExist] = await conn.query(query, body.genreId);
        if (!genreExist[0]){
            return 400;
        }
    }
    query = 'select count(*) from film_review where film_id =?'
    const[countReviews] = await conn.query(query, [id]);
    if (countReviews[0].count>0){
        Logger.http ('has reviews')
        return 403;
    }
    filmAuthorization[0] = Object.assign(filmAuthorization[0], body);
    query ='update film set title =?, description =?, release_date =?, image_filename =?, runtime=?, director_id=?, genre_id =?, age_rating=? where id =?'
    await conn.query(query, [filmAuthorization[0].title, filmAuthorization[0].description, filmAuthorization[0].release_date, filmAuthorization[0].image_filename, filmAuthorization[0].runtime, filmAuthorization[0].director_id, filmAuthorization[0].genre_id, filmAuthorization[0].age_rating, id]);
    return 200;
}
const deleteFilm= async(token:string, id:string): Promise<any>=>{
    if(!token){
        return 401;
    }
    const conn = await getPool().getConnection();
    let query = 'select * from film where id =?'
    const[filmInfo] = await conn.query (query, [id]);
    if (filmInfo[0]===undefined){
        return 404;
    }
    query = 'select id from user where auth_token=?'
    const[directorInfo] = await conn.query(query, [token]);
    if (directorInfo[0].id !== filmInfo[0].director_id){
        Logger.http ('not director')
        return 403;
    }
    if (filmInfo[0].film_image!=null) {
        fs.rmSync(`./storage/images/${filmInfo[0].image_filename}`);
    }
    await conn.query('delete from film where id =?', [id]);
    return 200;
}

export{getFilm,getGenre,addFilm,deleteFilm, editFilm,viewAllFilm}