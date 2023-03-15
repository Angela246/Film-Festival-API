import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schema from "../resources/schemas.json"
import * as users from '../models/user.server.model';
import Ajv from 'ajv';
const ajv = new Ajv({removeAdditional:'all',strict:false});

import randToken from 'rand-token';

const randomToken = async (x: number) : Promise<any> =>{
    return randToken.generate(x);
};
const validateEmail = async(email:string): Promise<any> =>{
    const emailRegex=/(([a-z]|[0-9])+(([.])([a-z]|[0-9])+)*([@])([a-z]|[0-9])+(([.])([a-z]|[0-9])+)+)/;
    if (email.match(emailRegex))
    {
        return true;
    }
    else{
        return false;
    }
}
const validate = async (schemas:object,data:any)=>{
    try{
        const validator = ajv.compile(schemas);
        const valid = await validator(data);
        if (!valid){
            return ajv.errorsText(validator.errors);
        }
        return true;
    }catch(err){
        return err.message;
    }
}

// Double check validation such as email validation and password
const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`Registering user with email: ${req.body.email}`)
    const validation = await validate( schema.user_register,req.body);
    const emailValidation = await validateEmail(req.body.email)

    if (validation!==true){
        res.statusMessage=`Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }
    else if (emailValidation ===false){
        res.statusMessage='Bad Request: data/email must match format "email"'
        res.status(400).send();
        return;
    }
    try {
            const result = await users.register(req.body.email,req.body.firstName,req.body.lastName,req.body.password);
            if (result!=null){
                res.status (200).send();
                return;
            }
            else{
                res.status(403).send("Forbidden. Email already in use");
                return;
            }
        } catch (err) {
            Logger.error(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
            return;
        }
};
// Doesn't check if email is in the database
const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`Logging user with: ${req.body.email}`)
    const token = await randomToken(32);
    const validation =await validate (schema.user_login,req.body);
    if (validation!==true){
        res.statusMessage=`Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }
    const emailValidation = await validateEmail(req.body.email);
     if (emailValidation ===false){
        res.statusMessage='Bad Request: data/email must match format "email"'
        res.status(400).send();
        return;
    }try{
        Logger.http(`Passed validation for email and password`);

        const result = await users.login(req.body.email, req.body.password,token);
        Logger.http(`Logging user with token: ${token}`)
        if (result == null){
            res.statusMessage='Not Authorised. Incorrect email/password'
            res.status(401).send();
            return;
        }
        else {
            res.status(200).send();
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}
const logout = async (req: Request, res: Response): Promise<void> => {
    const token= req.header("X-Authorization");
    Logger.http(`testing token: ${token}`);
    try{
        const response = await users.logout(token);
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}
const view = async (req: Request, res: Response): Promise<void> => {
    const token = req.header('X-Authorization');
    Logger.http(`Viewing user with token :${token}`);
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const update = async (req: Request, res: Response): Promise<void> => {
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}