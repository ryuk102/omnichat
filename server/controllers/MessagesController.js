import Message from "../models/MessageModel.js";
import {mkdirSync, renameSync} from "fs"

export const getMessages = async (req,res,next)=>{
    try{
         const user1=req.userId;
         const user2=req.body.id;

        if(!user1 || !user2){
            return res.status(400).send("Both user ids are required.")
        }

    
       const messages=await Message.find({
        $or:[
            {sender:user1,recipient:user2},
            {sender:user2,recipient:user1},
           ]
         }    
       ).sort({timeStamp:1})
        return res.status(200).json({messages});

       }catch(error){
       console.log({error});
       return res.status(500).json({message:"Internal server error",error:error.message});
       }
 }

 export const uploadFile = async (req,res,next)=>{
    try{
        if(!req.file){
            return res.status(400).send("File is required.")
        }
        const date=Date.now();
        let FileDr=`uploads/files/${date}`;
        let fileName=`${FileDr}/${req.file.originalname}`;

        mkdirSync(FileDr,{recursive:true});

        renameSync(req.file.path,fileName);

         return res.status(200).json({filePath:fileName});
       }catch(error){
       console.log({error});
       return res.status(500).json({message:"Internal server error",error:error.message});
       }
 }

