import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as reviews from '../models/film.review.server.model';
import * as schema from "../resources/schemas.json";
import * as validation from '../middleware/validation';

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
    const validationInput =await validation.validate (schema.film_review_post,req.body);
    if (validationInput!==true){
        res.statusMessage=`Bad Request: ${validationInput.toString()}`;
        res.status(400).send();
        return;
    }
    try{
        const result = await reviews.addReviews(req.body.rating, req.body.review, req.params.id,token);
        if (result ===401){
            res.statusMessage = "Unauthorized";
            res.status(401).send();
            return;
        }
        else if (result===404){
            res.statusMessage = "Not Found. No film found with id";
            res.status(404).send();
            return;
        }

        else if (result ===403){
            res.statusMessage = "Forbidden. Cannot review your own film, or cannot post a review on a film that has not yet released";
            res.status(403).send();
            return;
        }
        res.statusMessage="Created";
        res.status(201).send();
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}



export {getReviews, addReview}