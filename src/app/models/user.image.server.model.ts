import {getPool} from "../../config/db";
import * as path from 'path';
import * as fs from 'fs';
import Logger from "../../config/logger";

const getImageString = async (id: string) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = 'select image_filename from user where id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    if (result[0]==null){
        conn.release();
        return result;
    }
    else {
        const extension = path.extname(`${result[0].image_filename}`);
        const image = fs.readFileSync(`./storage/images/${result[0].image_filename}`)
        conn.release();
        return [image, extension];
    }
}

const setImageString = async (id: string,image:any, token:string, contentType:string) : Promise<any> =>{
    const extension = contentType.split("/");
    const imageType= extension[1];

    if (imageType!=="jpeg"&&imageType!=="jpg"&&imageType !=="png"&&imageType !=="gif"){
        return 400;
    }
    if (token==null){
        return 401;
    }
    const conn = await getPool().getConnection();
    let query ='select image_filename, auth_token from user where id =?'
    const [result] = await conn.query(query, [id]);
    if (result[0]==null){
        conn.release();
        return 404;
    }
    else if (result[0].auth_token !== token){
        conn.release();
        return 403;
    }
    const imageName= `user_${id}.${imageType}`;
    query= 'update user set image_filename = ? where id =?';
    const [updateImage] = await conn.query(query,[imageName,id]);
    // Image not storing in here
    fs.writeFileSync(`./storage/images/${imageName}`,image);
    if (result[0].image_filename == null){
        conn.release();
        return 201;
    }
    conn.release();
    return 200;
}

const deleteImageString = async (id: string, token:string) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = 'select image_filename, auth_token from user where id =?'
    const [result] = await conn.query(query, [id]);
    if (result[0]==null || result[0].image_filename==null){
        return 404;
    }
    else if (token !== result[0].auth_token){
        return 403;
    }
    fs.rmSync(`./storage/images/${result[0].image_filename}`);
    const deleteImageQuery = "Update user set image_filename = null where id =?"
    await conn.query(deleteImageQuery, [id]);
    return;

}


export{getImageString, setImageString,deleteImageString}