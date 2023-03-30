import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schema from "../resources/schemas.json"
import * as users from '../models/user.server.model';
import * as validation from '../middleware/validation';
// Double check validation such as email validation and password
const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`Registering user with email: ${req.body.email}`)
    const validationInput = await validation.validate( schema.user_register,req.body);
    const emailValidation = await validation.validateEmail(req.body.email)

    if (validationInput!==true){
        res.statusMessage=`Bad Request: ${validationInput.toString()}`;
        res.status(400).send(`Bad Request: ${validationInput.toString()}`);
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
                res.status (201).send({userId :result});
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
    const token = await validation.randomToken(32);
    const validationInput =await validation.validate (schema.user_login,req.body);
    if (validationInput!==true){
        res.statusMessage=`Bad Request: ${validationInput.toString()}`;
        res.status(400).send();
        return;
    }
    const emailValidation = await validation.validateEmail(req.body.email);
     if (emailValidation ===false){
        res.statusMessage='Bad Request: data/email must match format "email"'
        res.status(400).send();
        return;
    }try{
        const result = await users.login(req.body.email, req.body.password,token);
        if (result == null){
            res.statusMessage='Not Authorised. Incorrect email/password'
            res.status(401).send();
            return;
        }
        else {
            res.status(200).send(result);
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
    try{
        const response = await users.logout(token);

        if (response == null){
            res.statusMessage = "Unauthorized. Cannot log out if you are not authenticated";
            res.status(401).send();
            return;
        }
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
    try{
        Logger.http(`Viewing user with id: ${req.params.id}`)
        const response = await users.view(req.params.id,token);
        if (response === null){
            res.statusMessage=("Not Found. No user with specified ID");
            res.status(404).send();
            return;
        }
        res.status(200).send(response);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const update = async (req: Request, res: Response): Promise<void> => {
    const token = req.header('X-Authorization');
    const validationInput =await validation.validate (schema.user_edit,req.body);
    if (validationInput!==true){
        res.statusMessage=`Bad Request: ${validationInput.toString()}`;
        res.status(400).send();
        return;
    }

    if (req.body.email) {
        const emailValidation = await validation.validateEmail(req.body.email);
        if (emailValidation ===false) {
            res.statusMessage = 'Bad Request: data/email must match format "email"'
            res.status(400).send();
            return;
        }
    }
    try{
        const response = await users.update(req.params.id, token, req.body);

        if (response=== 401){
            res.statusMessage= "Unauthorized or Invalid currentPassword"
            res.status(401).send();
            return;
        }

        else if (response === 403){
            res.statusMessage= "Forbidden. This is not your account, or the email is already in use, or identical current and new passwords"
            res.status(403).send();
            return;
        }

        else if (response === 404){
            res.statusMessage= "Not Found"
            res.status(404).send();
            return;
        }
        res.status(200).send();
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}