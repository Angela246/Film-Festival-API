import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import {ResultSetHeader} from "mysql2";
import * as passwords from '../middleware/password.hash';

const register = async(email:string, firstname:string, lastname:string, password:string): Promise<ResultSetHeader> =>{
    const conn = await getPool().getConnection();
    const query = 'insert into user (email, first_name,last_name, password) values ( ? )';
    const emailQuery ='select * from user where email =?';
    const[existEmail]=await conn.query(emailQuery,[email]);
    if (existEmail[0]==null){
        password= await passwords.hash(password)

        const [result] = await conn.query(query, [[[email], [firstname], [lastname], [password]]]);
        await conn.release();
        return result.insertId;
    }
    else {
        conn.release();
        return null;
    }
};
const login =async(email:string, password:string, authToken:string) : Promise<any> => {
    const conn = await getPool().getConnection();
    let query = 'select id, password from user where email = ?';
    const [users]= await conn.query(query,[email]);
    if (users[0]==null){
        await conn.release();
        return null;
    } else if (!await passwords.checkPassword(password, users[0].password)){
        await conn.release();
        return null;
    } else{
        query='update user set auth_token =? where id =? and email =?';
        await conn.query(query, [authToken, users[0].id, email]);
        await conn.release();
        return {userId:users[0].id, token:authToken};
    }
}

const logout = async(token:string) : Promise<any> =>{
    if (token == null){
        return null;
    }
    const conn = await getPool().getConnection();
    let query = 'select * from user where auth_token = ?';
    const [users] = await conn.query(query, [token]);
    if (users[0]==null){
        await conn.release();
        return null;
    }
    query = 'update user set auth_token = null where auth_token = ?';
    const [result] = await conn.query(query, [token]);
    await conn.release();
    return result;
}

const view = async(id:string, token:string): Promise<any>=>{
    const conn = await getPool().getConnection();
    const query= 'select email,first_name,last_name,auth_token from user where id =?'
    const[users]=  await conn.query(query, [id]);
    if (!users[0]){
        await conn.release();
        return null;
    }
    else if (users[0].auth_token!=null && users[0].auth_token===token){
        await conn.release();
        return {email:users[0].email, firstName:users[0].first_name, lastName:users[0].last_name};
    }
    else if (users[0].auth_token==null ){
        await conn.release();
        return {firstName: users[0].first_name, lastName: users[0].last_name};
    }
}

const update = async(id:string, token:string, body:any ): Promise<any>=>{
    interface UpdatedBody {
        email?: string
        first_name?: string,
        last_name?: string,
        password?: string;
    }
    const updatedBody: UpdatedBody = {};
    const conn = await getPool().getConnection();
    if (!token) {
        conn.release();
        return 401;
    }
    let query = 'select * from user where id =?';
    const[currentUser] = await conn.query(query,[id]);
    if (!currentUser[0]){
        conn.release();
        return 404;
    }
    if (currentUser[0].auth_token !==token || body.password === body.currentPassword){
        conn.release();
        return 403;
    }
    if (body.email){
        updatedBody.email = body.email;
        query= 'select * from user where email = ?'
        const[emailQuery]= await conn.query(query,[body.email]);
        if (emailQuery[0]){
            conn.release();
            return 400;
        }
    }
    if (body.password){
        if (! await passwords.checkPassword(body.currentPassword, currentUser[0].password)){
            conn.release();
            return 401;
        }
        body.password = await passwords.hash(body.password)
        updatedBody.password = body.password
        delete body.currentPassword;
    }
    if (body.firstName){
        updatedBody.first_name = body.firstName;
    }
    if (body.lastName){
        updatedBody.last_name = body.lastName;
    }
    currentUser[0]=  Object.assign(currentUser[0], updatedBody);
    query = 'update user set email =?, first_name =?, last_name = ?, password =? where id =?'
    await conn.query(query, [currentUser[0].email, currentUser[0].first_name, currentUser[0].last_name, currentUser[0].password,id]);
    conn.release();
    return 200;

}

export{register,login,logout, view,update}
