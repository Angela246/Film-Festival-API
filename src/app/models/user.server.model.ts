import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import {ResultSetHeader} from "mysql2";

const register = async(email:string, firstname:string, lastname:string, password:string): Promise<ResultSetHeader> =>{
    Logger.info(`Adding user to the database`);
    const conn = await getPool().getConnection();
    const query = 'insert into user (email, first_name,last_name, password) values ( ? )';
    const emailQuery ='select * from user where email =?'
    const[existEmail]=await conn.query(emailQuery,[email]);
    if (existEmail.length>0){
        await conn.release();
        return null;
    }
    else {
        const [result] = await conn.query(query, [[[email], [firstname], [lastname], [password]]]);
        Logger.info(`Testing`);
        // Line 16 breaks the code
        await conn.release();
        return result;
    }
};

export{register}