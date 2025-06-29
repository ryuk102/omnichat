import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import multer from "multer";

const messageRoutes=Router();
const upload=multer({dest:"uploads/files"});

messageRoutes.post("/getMessages",verifyToken,getMessages);
messageRoutes.post("/uploadFile",verifyToken,upload.single("file"),uploadFile);



export default messageRoutes;
