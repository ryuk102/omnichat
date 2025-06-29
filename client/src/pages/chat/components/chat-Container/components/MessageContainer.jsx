import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store"
import { GET_ALL_MESSAGES_ROUTES, GET_CHANNEL_MESSAGES_ROUTE } from "@/utils/constants";
import moment from "moment";
import { useEffect,useRef} from "react";
import { HOST } from "@/utils/constants";
import { MdDownload } from "react-icons/md";
import { MdInsertDriveFile } from "react-icons/md";
import { useState } from "react";
import { MdClose } from "react-icons/md";
import { Avatar,AvatarImage,AvatarFallback } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
   const scrollRef=useRef()
   const{selectedChatType,selectedChatData,userInfo,selectedChatMessages,setSelectedChatMessages,
        setIsDownloading,setFileDownloadProgress}
        =useAppStore();

    const [showImage, setShowImage] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);



   useEffect(()=>{
    const getMessages=async()=>{
    
       try{
          const response=await apiClient.post(GET_ALL_MESSAGES_ROUTES,
           {id:selectedChatData._id},
           {withCredentials:true}
          );
          if(response.data.messages){
           setSelectedChatMessages(response.data.messages);
          }
       }catch(error){
         console.log({error});
       }
    };
    const getChannelMessages=async()=>{
      try{
        const response=await apiClient.get(`${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
         {withCredentials:true}
        );
        if(response.data.messages){
         setSelectedChatMessages(response.data.messages);
        }
     }catch(error){
       console.log({error});
     }
    }
    if(selectedChatData._id){
       if(selectedChatType==="contact") getMessages();
       else if(selectedChatType==="channel")getChannelMessages();
    }  
  }, [selectedChatType, selectedChatData,userInfo]);



   useEffect(()=>{
    if(scrollRef.current){
      scrollRef.current.scrollIntoView({behavior:"smooth"})
    }
  },[selectedChatMessages] );

  const checkIfImage=(filePath)=>{
    const imageRegex=/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|heic|heif|tiff)$/i;
    return imageRegex.test(filePath);
  }
    


   const renderMessages=()=>{
    let lastDate=null;
    return selectedChatMessages.map((message,index)=>{
 
      const messageDate=moment(message.timeStamp).format("YYYY-MM-DD");
      const showDate= messageDate!==lastDate;
      lastDate=messageDate;

      return(
        <div key={index} >
           {showDate
            && (<div className="text-center text-gray-500 my-2">
            {moment(message.timeStamp).format("LL")}
              </div>
             )}
             {
              selectedChatType==="contact" && renderDMMessages(message)
             }
             {
              selectedChatType==="channel" && renderChannelMessage(message)
             }
        </div>
      )
     });
   };  

   const downloadFile=async(url)=>{
     setIsDownloading(true);
      setFileDownloadProgress(0);
       const response=await apiClient.get(`${HOST}/${url}`,
           {responseType:"blob",
            onDownloadProgress:(data)=>{
             const {loaded,total}=data;
             setFileDownloadProgress(Math.round((loaded/total)*100));
            },
           });

       const urlBlob=window.URL.createObjectURL(new Blob([response.data]));
        const link=document.createElement("a");
        link.href=urlBlob;
        link.setAttribute("download",url.split("/").pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(urlBlob);
        setIsDownloading(false);
        setFileDownloadProgress(0);
   }


  const renderDMMessages=(message)=>(
    
    <div className={`${
       message.sender===selectedChatData._id ?"text-left":"text-right"}`}
    >
    {
      message.messageType==="text" && (
        <div className={`${
         message.sender!==selectedChatData._id 
         ? "bg-[#8417ff]/5 text-[#8417ff]/90  border-[#8417ff]/50"
         : "bg-[#2a2b33]/5 text-white/90  border-[#ffffff]/20"

        } border inline-block p-4 rounded my-1 max-w[50%] break-words`}
      > 
         {message.content}
     </div>
      )    

    }

    {
      message.messageType==="file" &&  (<div className={`${
         message.sender!==selectedChatData._id 
         ? "bg-[#8417ff]/5 text-[#8417ff]/90  border-[#8417ff]/50"
         : "bg-[#2a2b33]/5 text-white/90  border-[#ffffff]/20"

        } border inline-block p-4 rounded my-1 max-w[50%] break-words`}
        > 
         {checkIfImage(message.fileUrl)? (<div 
            className="cursor-pointer"
             onClick={()=>{
              setShowImage(true);
              setImageUrl(message.fileUrl);
             }}
            >
          <img src={`${HOST}/${message.fileUrl}`} height={300} width={300}/>
         </div>):
          (<div className="flex items-center justify-center gap-4">
             <span className="text-white/ text-3xl bg-black/20 rounded-full p-2">
             <MdInsertDriveFile/>
             </span>
             <span>
              {message.fileUrl.split("/").pop()}
             </span>
             <span className="bg-black/20 p-3 text-2xl rounded-full  hover:bg-black/50 cursor-pointer duration-300 transition-all"
             onClick={()=>downloadFile(message.fileUrl)}
             >
              <MdDownload/>
             </span>
          </div>)
          }
     </div>)
    }
     <div className="text-xs text-gray-600">
        {moment(message.timeStamp).format("LT")}
     </div>
    </div>
);

  const renderChannelMessage=(message)=>{
    return (
      <div className={`mt-5 ${message.sender._id !==userInfo.id ? "text-left" :"text-right"}`}>
          {
      message.messageType==="text" && (
        <div className={`${
         message.sender._id===userInfo.id 
         ? "bg-[#8417ff]/5 text-[#8417ff]/90  border-[#8417ff]/50"
         : "bg-[#2a2b33]/5 text-white/90  border-[#ffffff]/20"

        } border inline-block p-4 rounded my-1 max-w[50%] break-words ml-7`}
      > 
         {message.content}
     </div>
      )    
         }
         {
      message.messageType==="file" &&  (<div className={`${
         message.sender._id===userInfo.id 
         ? "bg-[#8417ff]/5 text-[#8417ff]/90  border-[#8417ff]/50"
         : "bg-[#2a2b33]/5 text-white/90  border-[#ffffff]/20"

        } border inline-block p-4 rounded my-1 max-w[50%] break-words`}
        > 
         {checkIfImage(message.fileUrl)? (<div 
            className="cursor-pointer"
             onClick={()=>{
              setShowImage(true);
              setImageUrl(message.fileUrl);
             }}
            >
          <img src={`${HOST}/${message.fileUrl}`} height={300} width={300}/>
         </div>):
          (<div className="flex items-center justify-center gap-4">
             <span className="text-white/ text-3xl bg-black/20 rounded-full p-2">
             <MdInsertDriveFile/>
             </span>
             <span>
              {message.fileUrl.split("/").pop()}
             </span>
             <span className="bg-black/20 p-3 text-2xl rounded-full  hover:bg-black/50 cursor-pointer duration-300 transition-all"
             onClick={()=>downloadFile(message.fileUrl)}
             >
              <MdDownload/>
             </span>
          </div>)
          }
     </div>)
    }  
     {
      message.sender._id!==userInfo.id ? (<div className="flex items-center justify-start gap-3">
      <Avatar className="h-8 w-8 rounded-full overflow-hidden">
            {
              message.sender.image && (<AvatarImage
                src={`${HOST}/${message.sender.image}`} 
                alt="profile"
                className="object-cover w-full h-full bg-black"
              />)}
              
                 <AvatarFallback className={`uppercase h-8 w-8 text-lg  flex items-center justify-center rounded-full  ${getColor(message.sender.color)}`}>
                 {message.sender.firstName
                   ? message.sender.firstName.split("").shift()
                   :message.sender.email.split("").shift()}
                 </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
          <span className="text-xs text-white/60">{moment(message.timeStamp).format("LT")} </span>
      </div> ):(
        <div className="text-xs text-white/60 mt-1">{moment(message.timeStamp).format("LT")} </div>
      )
     }
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full"> 
     {renderMessages()}
     <div ref={scrollRef} />
     {
      showImage && (<div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw]  flex items-center justify-center backdrop-blur-lg flex-col">
         <div>
          <img src={`${HOST}/${imageUrl}`} 
          className="h-[80vh] w-full bg-cover"
          />
         </div>
         <div className="flex gap-5 fixed top-0 mt-5">
            <button className="bg-black/20 p-3 text-2xl rounded-full  hover:bg-black/50 cursor-pointer duration-300 transition-all"
             onClick={()=>downloadFile(imageUrl)}
            >
              <MdDownload/>
            </button>
            <button className="bg-black/20 p-3 text-2xl rounded-full  hover:bg-black/50 cursor-pointer duration-300 transition-all"
             onClick={()=>{
              setShowImage(false);
              setImageUrl(null);
             }}
            >
              <MdClose/>
            </button>
         </div>
      </div>)
     }
    </div>
  )
}

export default MessageContainer