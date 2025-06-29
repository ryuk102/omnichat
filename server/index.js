import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/AuthRoutes.js';
import contactRoutes from './routes/ContactRoutes.js';
import setupSocket from './socket.js';
import messageRoutes from './routes/MessagesRoutes.js';
import channelRoutes from './routes/ChannelRoutes.js';
import path from 'path';

dotenv.config();

const app=express();
const port=process.env.PORT ||3001;
const MONGODB_URL=process.env.MONGODB_URL;

const __dirname = path.resolve();   

app.use(cors({
    origin:process.env.ORIGIN,  
    methods:["GET","POST","PUT","PATCH","DELETE"],
    credentials:true,
}));

app.use("/uploads/profiles",express.static("uploads/profiles"));
app.use("/uploads/files",express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/contacts",contactRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/channel",channelRoutes);


app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});
const server=app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

setupSocket(server);

mongoose
.connect(MONGODB_URL)
.then(()=>{console.log("Connected to MongoDB")})
.catch((err)=>{console.log(err.message)});