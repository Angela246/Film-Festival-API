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

const addReviews = async(rating:number, review:string, id:string,token:string): Promise<any> => {
    if (token === undefined) {
        return 401;
    }
    const conn = await getPool().getConnection();
    let query = 'select * from user where auth_token=?';
    const [userValidation] = await conn.query(query, [token]);
    query = 'select director_id from film where id =?';
    const [directorValidation] = await conn.query(query, [parseInt(id,10)]);
    if (directorValidation[0] === undefined) {
        conn.release();
        return 404;
    }
    if (directorValidation[0].director_id === userValidation[0].id) {
        conn.release();
        return 403;
    }
    const timestamp = new Date();
    query = 'insert into film_review (film_id, user_id, rating, review, timestamp) values (?,?,?,?,?)';
    await conn.query(query,[id, userValidation[0].id, rating,review,timestamp]);
    conn.release();
    return;
}

export{getReviews,addReviews}