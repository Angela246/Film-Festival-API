import {getPool} from "../../config/db";
import Logger from "../../config/logger";

const getReviews = async (id: string) : Promise<any> => {
    const conn =await getPool().getConnection();
    const query = 'select user_id as reviewerId,user.first_name as reviewerFirstName, user.last_name as reviewerLastName, rating,review,timestamp from film_review JOIN user ON film_review.user_id = user.id where film_review.film_id =? order by timestamp desc';
    const [result]= await conn.query(query,[parseInt(id,10)]);
    conn.release();
    if (result[0] === undefined){
        return null;
    }
    return result;
}

// TODO no authorisation

const addReviews = async(rating:number, review:string, id:string,token:string): Promise<any> => {
    const conn = await getPool().getConnection();
    // When user is logged out, token is suppose to be null but it's coming up as not null
    Logger.http(`imageType: ${token}`)
    if (token === undefined) {
        return 401;
    }
    let query = 'select id from user where auth_token=?';
    const [result] = await conn.query(query, [token]);
    query = 'select director_id from film where id =?';
    const [results] = await conn.query(query, [parseInt(id,10)]);
    if (results[0] === undefined) {
        return 404;
    }
    if (results[0].director_id === result[0].id) {
        return 403;
    }
    const timestamp = new Date();
    query = 'insert into film_review (film_id, user_id, rating, review, timestamp) values (?,?,?,?,?)';
    const [insertReview]= await conn.query(query,[id, result[0].id, rating,review,timestamp]);
    conn.release();
    return insertReview.insertId;
}

export{getReviews,addReviews}