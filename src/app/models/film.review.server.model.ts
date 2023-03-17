import {getPool} from "../../config/db";

const getReviews = async (id: string) : Promise<any> => {
    const conn =await getPool().getConnection();
    const query = 'select user_id as reviewerId,user.first_name as reviewerFirstName, user.last_name as reviewerLastName, rating,review,timestamp from film_review JOIN user ON film_review.user_id = user.id where film_review.film_id =? order by timestamp desc';
    const [result]= await conn.query(query,[parseInt(id,10)]);
    conn.release();
    if (result[0] ==null){
        return null;
    }
    return result;
}

const addReviews = async(rating:number, review:string, id:string,token:string): Promise<any> => {
    const conn = await getPool().getConnection();
    if (token == null) {
        return 401;
    }
    let query = 'select id from user where auth_token=?';
    const [result] = await conn.query(query, [token]);

    query = 'select director_id from film where id =?';
    const [results] = await conn.query(query, [id]);

    if (results[0] == null) {
        return 404;
    }

    if (results[0].director_id === result[0].id) {
        return 403;
    }
    const timestamp = new Date();
    query = 'insert into film_review (film_id, user_id, rating, review, timestamp) values (?,?,?,?,?)';
    const [insertReview]= await conn.query(query,[id, result[0].id, rating,review,timestamp]);
    conn.release();
    return insertReview;
}

export{getReviews,addReviews}