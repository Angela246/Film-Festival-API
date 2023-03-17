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
        await conn.release();
        return result.insertId;
    }
};
const login =async(email:string, password:string, token:string) : Promise<any> => {
    const conn = await getPool().getConnection();
    let query = 'select id, password from user where email = ?';
    const [users]= await conn.query(query,[email]);
    if (users[0]==null){
        await conn.release();
        return null;
    } else if (password.localeCompare(users[0].password)){
        await conn.release();
        return null;
    }
    else{
        query='update user set auth_token =? where id =? and email =?';
        const[result]= await conn.query(query, [token, users[0].id, email]);
        await conn.release();
        return {userId:users[0].id, token};
    }
}

const logout = async(token:string) : Promise<any> =>{
    Logger.info(`Logging out user`);
    const conn = await getPool().getConnection();
    let query = 'select * from user where auth_token = ?';
    const [users] = await conn.query(query, [token]);
    if (users[0]==null){
        Logger.info(`Reach this part? ${token}`);
        await conn.release();
        return null;
    }
    query = 'update user set auth_token = null where auth_token = ?';
    const [result] = await conn.query(query, [token]);
    await conn.release();
    return result;
}
const view = async(id:string, token:string): Promise<any>=>{
    Logger.info(`Viewing user details`);
    const conn = await getPool().getConnection();
    const query= 'select email,first_name,last_name,auth_token from user where id =?'
    const[users]=  await conn.query(query, [id]);
    if (users[0] ==null){
        await conn.release();
        return null;
    }
    else if (users[0].auth_token!=null && users[0].auth_token===token){
        await conn.release();
        return {email:users[0].email};
    }
    else if (users[0].auth_token==null ){
        await conn.release();
        return {firstName: users[0].first_name, lastName: users[0].last_name};
    }
}

const update = async(id:string, token:string): Promise<any>=>{

}


export{register,login,logout, view,update}