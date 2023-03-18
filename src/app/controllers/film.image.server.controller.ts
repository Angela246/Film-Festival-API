import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as filmsImage from '../models/film.image.server.model';


const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const imageResult = await filmsImage.getFilmImage(req.params.id);
        res.setHeader("Content-Type", "image/png");
        if (imageResult == null||imageResult[0] ==null|| imageResult[1]==null){
            res.statusMessage ="Not found. No film found with id, or film has no image";
            res.status(404).send();
            return;
        }
        else if (imageResult[1]===".gif"){
            res.setHeader("Content-Type", "image/gif");
            res.status(200).send(imageResult[0]);
        }
        else if (imageResult[1]===".jpg"){
            res.setHeader("Content-Type", "image/jpeg");
            res.status(200).send(imageResult[0]);
        }
        else{
            res.status(200).send(imageResult[0]);
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}
const setImage = async (req: Request, res: Response): Promise<void> => {
    const token= req.header("X-Authorization");
    const contentType = req.headers['content-type'];
    const extension = contentType.split("/");
    try{
        const imageResult = await filmsImage.setFilmImage(req.params.id, req.body, token,contentType)
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

export {getImage, setImage};