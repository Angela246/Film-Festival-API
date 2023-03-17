import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as usersImage from '../models/user.image.server.model';

const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const imageResult = await usersImage.getImageString(req.params.id);
        res.setHeader("Content-Type", "image/png");
        if (imageResult == null||imageResult[0] ==null|| imageResult[1]==null){
            res.statusMessage ="Not Found. No user with specified ID, or user has no image";
            res.status(404).send();
            return;
        }
        else if (imageResult[1]==="gif"){
            res.setHeader("Content-Type", "image/gif");
            res.status(200).send(imageResult[0]);
        }
        else if (imageResult[1]==="jpeg"){
            res.setHeader("Content-Type", "image/gif");
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
    Logger.info(`Reach this part?${extension[1]}`);
    try{
        const imageResult = await usersImage.setImageString(req.params.id, req.body, token,contentType)
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


const deleteImage = async (req: Request, res: Response): Promise<void> => {
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

export {getImage, setImage, deleteImage}