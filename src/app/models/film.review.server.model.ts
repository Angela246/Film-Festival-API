import {getPool} from "../../config/db";

const getReviews = async (id: string) : Promise<any> => {
    const conn =await getPool().getConnection();

    // sql syntax doesn't work.
    const query = 'select user_id as reviewId, rating,review, user.first_name as reviewFirstName, user.last_name as reviewerLastName,timestamp'+
        'from film_review JOIN user ON film_review.user_id = user.id '+'where film_id =? order by timestamp desc';
    const [result]= await conn.query(query,[parseInt(id,10)]);
    conn.release();
    if (result[0] ==null){
        return null;
    }
    return result;
}

const addReviews = async(rating:number, review:string, id:string,token:string): Promise<any> => {
    const conn =await getPool().getConnection();
    if (token==null){
        return 401;
    }
}
export{getReviews,addReviews}