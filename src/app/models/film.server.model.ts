import { getPool } from '../../config/db';
import Logger from '../../config/logger';

// const viewAllFilm = async(query:any) : Promise<any> =>{
//     Logger.info ("Getting all film from the database");
//     const conn = await getPool().getConnection();
//
// }

const getFilm = async(id:string): Promise<any>=>{
    const conn = await getPool().getConnection();
    Logger.info(`Reach this part? ${id}`);
    let query = 'select * from film where id=?'
    const[filmInfo] = await conn.query(query,[parseInt(id,10)]);
    if (filmInfo[0]==null){
        return 404;
    }
    query = 'select user.first_name, user.last_name from user where id=?'
    const[directorInfo]= await conn.query(query,[filmInfo[0].director_id])

    query ='select count(*) as numReview,avg(rating) as ratingAverage from film_review where film_id =?'
    const[reviewCount]= await conn.query(query, [id]);
    return {filmId:filmInfo[0].id, title: filmInfo[0].title, genreId: filmInfo[0].genre_id, ageRating:filmInfo[0].age_rating, directorId:filmInfo[0].director_id, directorFirstName:directorInfo[0].first_name, directorLastName:directorInfo[0].last_name,rating:reviewCount[0].ratingAverage, releaseDate:filmInfo[0].release_date, description:filmInfo[0].description, runtime: filmInfo[0].runtime, numRatings:reviewCount[0].numReview }

}

const getGenre= async ()=>{
    const conn = await getPool().getConnection();
    const [result]= await conn.query('select id as genreId,name from genre');
    return result;
}
export{getFilm,getGenre}