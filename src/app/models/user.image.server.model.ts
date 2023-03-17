import {getPool} from "../../config/db";
import * as path from 'path';
import * as fs from 'fs';
import Logger from "../../config/logger";

const getImageString = async (id: string) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    if (result[0].image_filename==null||result[0]==null){
        conn.release();
        return;
    }
    else {
        const extension = path.extname(`${result[0].image_filename}`);
        const image = fs.readFileSync(`./storage/images/${result[0].image_filename}`)
        conn.release();
        return [image, extension];
    }
}

const setImageString = async (id: string,image:any, token:string, contentType:string) : Promise<any> =>{
    if (token==null){
        return 401;
    }
    const conn = await getPool().getConnection();
    const query ='select image_filename, auth_token from user where id =?'
    const [result] = await conn.query(query, [id]);
    if (result[0]==null){
        return 404;
    }
    else if (result[0].auth_token !== token){
        return 403;
    }
    const extension = contentType.split("/");
    const imageType= extension[1];

}


export{getImageString, setImageString}