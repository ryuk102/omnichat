import Router from 'express';
import { createChannel,getChannelMessages,getUserChannels } from '../controllers/ChannelController.js';
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const channelRoutes = Router();

channelRoutes.post("/createChannel",verifyToken,createChannel);
channelRoutes.get("/getUserChannels",verifyToken,getUserChannels);
channelRoutes.get("/getChannelMessages/:channelId",verifyToken,getChannelMessages);

export default channelRoutes;
