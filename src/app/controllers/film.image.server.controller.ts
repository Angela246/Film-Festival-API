import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as filmsImage from '../models/film.image.server.model';
import logger from "../../config/logger";


const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const imageResult = await filmsImage.getFilmImage(req.params.id);
        res.setHeader("content-type", "image/png");
        if (imageResult == null||imageResult[0] ==null|| imageResult[1]==null){
            res.statusMessage ="Not found. No film found with id, or film has no image";
            res.status(404).send();
            return;
        }
        else if (imageResult[1]===".gif"){
            res.setHeader("content-type", "image/gif");
            res.status(200).send(imageResult[0]);
            return;
        }
        else if (imageResult[1]===".jpg"){
            res.setHeader("content-type", "image/jpeg");
            res.status(200).send(imageResult[0]);
            return;
        }
        else{
            res.status(200).send(imageResult[0]);
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}
const setImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const token= req.header("X-Authorization");
        const contentType = req.headers['content-type'];
        const imageResult = await filmsImage.setFilmImage(req.params.id, req.body, token,contentType)
        if (imageResult ===400){
            res.statusMessage = "Bad Request";
            res.status(400).send();
            return;
        }
        if (imageResult ===401){
            res.statusMessage = "Unauthorized";
            res.status(401).send();
            return;
        }
        if (imageResult ===403){
            res.statusMessage = "Forbidden. Only the director of a film can change the hero image";
            res.status(403).send();
            return;
        }
        if (imageResult ===404){
            res.statusMessage = "Not Found. No film found with id";
            res.status(404).send();
            return;
        }
        if (imageResult ===201){
            res.statusMessage="Created";
            res.status(201).send();
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

export {getImage, setImage};