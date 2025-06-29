import Channel from "../models/ChannelModel.js";
import { User } from "../models/UserModel.js";
import mongoose from "mongoose";

export const createChannel=async (req,res,next)=>{
    try{
        const {name,members}=req.body;
        const userId=req.userId;

        const admin=await User.findById(userId);

        if(!admin){
            return res.status(400).json({message:"Admin not found"});
        }
        const validMembers=await User.find({_id:{$in:members}});
        if(validMembers.length!==members.length){
            return res.status(400).json({message:"Some members are not valid users."});
        }
        const newChannel=new Channel({
            name,
            members,
            admin:userId,
        });

        await newChannel.save();
        return res.status(201).json({message:"Channel created successfully",channel:newChannel});
       }catch(error){
       console.log({error});
       return res.status(500).json({message:"Internal server error",error:error.message});
       }
 }

 export const getUserChannels=async (req,res,next)=>{
    try{
        const userId=new mongoose.Types.ObjectId(req.userId);
        const channels=await Channel.find({
            $or:[{admin:userId},{members:userId}],
        }).sort({updatedAt:-1});
        
       
        return res.status(201).json({channels});
       }catch(error){
       console.log({error});
       return res.status(500).json({message:"Internal server error",error:error.message});
       }
 }

 export const getChannelMessages=async (req,res,next)=>{
    try{
         const {channelId}=req.params;
         const channel =await Channel.findById(channelId).populate({
            path:"messages",
            populate:{
               path:"sender",
               select:"firstName lastName email _id image color",
            },   
         });
         if(!channel){
            return res.status(404).send("Channel not found.");
         }
           const messages=channel.messages;
            return res.status(201).json({messages});
       }catch(error){
       console.log({error});
       return res.status(500).json({message:"Internal server error",error:error.message});
       }
 }