import { useAppStore } from "@/store"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container/ContactsContainer";
import EmptyChatContainer from "./components/emptyChatContainer";
import ChatContainer from "./components/chat-Container/ChatContainer";


const Chat = () => {
  const {userInfo,selectedChatType,isUploading,isDownloading,fileUploadProgress,fileDownloadProgress}=useAppStore();
  const navigate=useNavigate();
  
  useEffect(()=>{
     if(!userInfo.profileSetup){
       toast.message("Please setup profile to continue");
       navigate("/profile")
     }
  },[userInfo,navigate])
 
  return <div className="flex h-[100vh] text-white overflow-hidden">
    {
      isUploading &&(
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">
            Uploading File {fileUploadProgress}%
          </h5>
        </div>
      )
    }
    {
      isDownloading &&(
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">
            Downloading File {fileDownloadProgress}%
          </h5>
        </div>
      )
    }
     <ContactsContainer/>
     {
      selectedChatType===undefined?(<EmptyChatContainer/>):(<ChatContainer/>)
     }
  </div>
}

export default Chat