import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as reviews from '../models/film.review.server.model';
import * as schema from "../resources/schemas.json";
import Ajv from "ajv";
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

const getReviews = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await reviews.getReviews(req.params.id);
        if (result == null){
            res.statusMessage = "Not Found. No film found with id";
            res.status(404).send();
            return;
        }
        res.status(200).send(result);
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const addReview = async (req: Request, res: Response): Promise<void> => {
    const token= req.header("X-Authorization");
    const validation =await validate (schema.film_review_post,req.body);
    if (validation!==true){
        res.statusMessage=`Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }
    try{
        const result = await reviews.addReviews(req.body.rating, req.body.review, req.params.id,token);
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



export {getReviews, addReview}