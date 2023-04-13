import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as usersImage from '../models/user.image.server.model';

const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const imageResult = await usersImage.getImageString(req.params.id);
        Logger.http(`imageType:${imageResult[1]}`)
        res.setHeader("Content-Type", "image/png");
        if (imageResult === 404){
            res.statusMessage ="Not Found. No user with specified ID, or user has no image";
            res.status(404).send();
            return;
        }
        else if (imageResult[1]===".gif"){
            res.setHeader("Content-Type", "image/gif");
            res.status(200).send(imageResult[0]);
            return;
        }
        else if (imageResult[1]===".jpg"||imageResult[1]===".jpeg"){
            res.setHeader("Content-Type", "image/jpeg");
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
        const extension = contentType.split("/");
        const imageResult = await usersImage.setImageString(req.params.id, req.body, token,contentType)
        if (imageResult ===400){
            res.statusMessage="Bad Request. Invalid image supplied (possibly incorrect file type)"
            res.status(400).send();
            return;
        }
        if (imageResult ===401){
            res.statusMessage="Unauthorized"
            res.status(401).send();
            return;
        }
        else if (imageResult === 403){
            res.statusMessage="Forbidden. Can not change another user's profile photo"
            res.status(403).send();
            return;
        }

        else if (imageResult === 404){
            res.statusMessage="Not found. No such user with ID given"
            res.status(404).send();
            return;
        }

        else if (imageResult === 200){
            res.statusMessage= "OK. Image updated"
            res.status(200).send();
            return;

        }

        else if (imageResult === 201){
            res.statusMessage= "Created. New image created"
            res.status(201).send();
            return;
        }

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const deleteImage = async (req: Request, res: Response): Promise<void> => {
    const token= req.header("X-Authorization");
    if (token ==null){
        res.statusMessage = "Unauthorized";
        res.status(401).send();
        return;
    }
    try{
        const imageResult = await usersImage.deleteImageString(req.params.id,token);
        if (imageResult ===403){
            res.statusMessage = "Forbidden. Can not delete another user's profile photo";
            res.status(403).send();
            return;
        }
        else if (imageResult ===404){
            res.statusMessage = "Not Found. No such user with ID given";
            res.status(404).send();
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

export {getImage, setImage, deleteImage}