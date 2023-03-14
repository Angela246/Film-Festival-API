import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schema from "../resources/schemas.json"
import * as users from '../models/user.server.model';
import Ajv from 'ajv';
const ajv = new Ajv({removeAdditional:'all',strict:false});
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

    if (validation!==true){
        res.statusMessage=`Bad Request: ${validation.toString()}`;
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

const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`Logging user with: ${req.body.email}`)
    const validation =await validate (schema.user_login,req.body);
    if (validation!==true){
        res.statusMessage=`Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }
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

const logout = async (req: Request, res: Response): Promise<void> => {

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

const view = async (req: Request, res: Response): Promise<void> => {
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