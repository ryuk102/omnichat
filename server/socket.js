import {Server as SocketIoServer} from "socket.io"
import Message from "./models/MessageModel.js";
import Channel from "./models/ChannelModel.js";
import { encryptMessage,decryptMessage } from "./utils/crypto.js";

const setupSocket=(server)=>{
   const io=new SocketIoServer(server,{
    cors:{
        origin:process.env.ORIGIN,
        methods:["GET","POST"],
        credentials:true
    }
   });

   const userSocketMap=new Map();

   const disconnect=(socket)=>{
     console.log(`Client Disconnected:${socket.id} `);
     for(const[userId,socketId] of userSocketMap.entries()){
        if(socketId===socket.id){
            userSocketMap.delete(userId);
            break;
        }
     }
   }

   const sendMessage= async(message)=>{
     const senderSocketId=userSocketMap.get(message.sender);
     const recipientSocketId=userSocketMap.get(message.recipient);
     
     //messaage encryption
      const encryptedContent = message.content
    ? encryptMessage(message.content)
    : undefined;

    const createMessage = await Message.create({
    ...message,
    content: encryptedContent,
     });

     const MessageData=await Message.findById(createMessage._id)
       .populate("sender","id email firstName lastName image color")
       .populate("recipient","id email firstName lastName image color")
      
       // Decrypt before emitting
     const finalMessage = {
       ...MessageData.toObject(),
       content: encryptedContent ? decryptMessage(encryptedContent) : undefined,
     };
       if(recipientSocketId){
         io.to(recipientSocketId).emit("recieveMessage",finalMessage);
       }
       if(senderSocketId){
         io.to(senderSocketId).emit("recieveMessage",finalMessage);
       }
     } ;


    const sendChannelMessage=async (message) => {
      const{channelId,sender,content,messageType,fileUrl}=message;
      
      const encryptedContent = content ? encryptMessage(content) : undefined;


      const createMessage=await Message.create({
        sender,
        recipient:null,
        content:encryptedContent,
        messageType,
        timeStamp:new Date(),
        fileUrl,
      });

      const messageData=await Message.findById(createMessage._id)
        .populate(
        "sender",
        "id email firstName lastName image color"
           ).exec();

      await Channel.findByIdAndUpdate(channelId,{
        $push:{
          messages:createMessage._id,
        },
      });
      const channel=await Channel.findById(channelId).populate("members");
      const finalData={...messageData._doc,content: encryptedContent ? decryptMessage(encryptedContent) : undefined,channelId:channel._id};

      if(channel && channel.members){
        channel.members.forEach((member) => {
          const memberSocketId=userSocketMap.get(member._id.toString());
          if(memberSocketId ){
            io.to(memberSocketId).emit("recieveChannelMessage",finalData);
          }    
        });
        const adminSocketId=userSocketMap.get(channel.admin._id.toString());
          if(adminSocketId ){
            io.to(adminSocketId).emit("recieveChannelMessage",finalData);
          }
    }

  }

   io.on("connection",(socket)=>{
      const userId=socket.handshake.query.userId;

      if(userId){
        userSocketMap.set(userId,socket.id);
        console.log(`User connected ${userId} with socket ID: ${socket.id}` )
      }else{
      console.log("user ID not provided during connection.");
      }

      // socket.on("sendMessage",sendMessage);
      socket.on("sendMessage", async (message) => {
         message.sender = userId; // inject the sender from handshake
         await sendMessage(message);
       });
       
    

      socket.on("sendChannelMessage",sendChannelMessage);
      socket.on("disconnect",()=>disconnect(socket))
   });
};

export default setupSocket;