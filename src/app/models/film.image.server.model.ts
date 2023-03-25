import {getPool} from "../../config/db";
import path from "path";
import fs from "fs";
import Logger from "../../config/logger";

const getFilmImage = async (id: string) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = 'select image_filename from film where id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    if (result[0]===undefined||result[0].image_filename==null){
        conn.release();
        return result
    }
    else{
        const extension = path.extname(`${result[0].image_filename}`);
        const image = fs.readFileSync(`./storage/images/${result[0].image_filename}`)
        conn.release();
        return [image, extension];
    }
}

const setFilmImage = async (id: string,image:any, token:string, contentType:string) : Promise<any> =>{
    if (!id||!image||!contentType){
        return 400;
    }
    const extension = contentType.split("/");
    const imageType= extension[1];
    if (imageType!=="jpeg"&&imageType!=="jpg"&&imageType !=="png"&&imageType !=="gif"){
        return 400;
    }
    if(token==null){
        return 401;
    }
    const conn = await getPool().getConnection();
    let query = 'select film.image_filename, user.auth_token from user join film on user.id = film.director_id where film.id =?'
    const [result] = await conn.query (query, [id]);
    if (result[0]===undefined){
        return 404;
    }
    else if (token !== result[0].auth_token){
        return 403;
    }
    // TODO not being added to storage
    const imageName = `film_${id}.${imageType}`
    query ='update film set image_filename =? where id =?';
    await conn.query(query,[imageName,id]);
    fs.writeFileSync(`./storage/images/${imageName}`,image);
    conn.release();
    if (result[0].image_filename==null){
        return 201;
    }
    return 200;

}

export{getFilmImage,setFilmImage}