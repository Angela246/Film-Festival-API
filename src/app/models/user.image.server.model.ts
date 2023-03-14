import {getPool} from "../../config/db";
import mime from 'mime';

const getImageString = async (id: number) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();

}

export{getImageString}