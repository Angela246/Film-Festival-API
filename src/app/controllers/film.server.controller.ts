import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as film from "../models/film.server.model";
import * as validation from '../middleware/validation';
import * as schema from "../resources/schemas.json";

const viewAll = async (req: Request, res: Response): Promise<void> => {
    const validationInput = await validation.validate(schema.film_search,req.query);
    // Logger.info(`count index ${req.query.count}`)
    if (validationInput!==true){
        Logger.info('error director id at controller')
        res.statusMessage=`Bad Request: ${validationInput.toString()}`;
        res.status(400).send();
        return;
    }
    try{
        const result = await film.viewAllFilm(req.query);

        if (result===400){
            res.status(400).send();
            return
        }
        res.status( 200 ).send( result );
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getOne = async (req: Request, res: Response): Promise<void> => {
    try{
        const result =await film.getFilm(req.params.id);

        if (result ===404){
            res.statusMessage = "Not Found. No film with id";
            res.status(404).send();
            return;
        }
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addOne = async (req: Request, res: Response): Promise<void> => {
    const token= req.header("X-Authorization");
    const validationInput = await validation.validate( schema.film_post,req.body);
    if (validationInput!==true){
        res.statusMessage=`Bad Request: ${validationInput.toString()}`;
        res.status(400).send();
        return;
    }
    try{
        const result = await film.addFilm(token, req.body);

        if (result=== 400){
            res.statusMessage = "Bad Request";
            res.status(400).send();
            return;

        }

        if (result === 401){
            res.statusMessage = "Unauthorized";
            res.status(401).send();
            return
        }

        if (result === 403){
            res.statusMessage = "Forbidden. Film title is not unique, or cannot release a film in the past";
            res.status(403).send();
            return
        }
        res.status(201).send({filmId :result});
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editOne = async (req: Request, res: Response): Promise<void> => {
    const token= req.header("X-Authorization");
    Logger.http(`token is ${req.body.releaseDate}`)
    const validationInput = await validation.validate( schema.film_patch,req.body);
    if (validationInput!==true){
        res.statusMessage=`Bad Request: ${validationInput.toString()}`;
        res.status(400).send();
        return;
    }
    Logger.http(`testing here`)

    try{
        const result = await film.editFilm(token, req.body, req.params.id);
        if (result ===401){
            res.statusMessage = "Unauthorized";
            res.status(401).send();
            return;
        }
        if (result === 404){
            res.statusMessage = "Not Found. No film found with id";
            res.status(404).send();
            return;
        }
        if (result ===403){
            res.statusMessage = "Forbidden. Only the director of an film may change it, cannot change the releaseDate since it has already passed, cannot edit a film that has a review placed, or cannot release a film in the past";
            res.status(403).send();
            return
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

const deleteOne = async (req: Request, res: Response): Promise<void> => {
    const token= req.header("X-Authorization");
    Logger.http(`token is ${token}`)
    try{
        const result = await film.deleteFilm(token,req.params.id);
        if (result ===401){
            res.statusMessage = "Unauthorized";
            res.status(401).send();
            return;
        }
        if (result === 403){
            res.statusMessage = "Forbidden. Only the director of an film can delete it";
            res.status(403).send();
            return;
        }

        if (result ===404){
            res.statusMessage = "Not Found. No film found with id";
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

const getGenres = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await film.getGenre();
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {viewAll, getOne, addOne, editOne, deleteOne, getGenres};