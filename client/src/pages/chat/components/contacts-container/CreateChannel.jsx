import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import {FaPlus} from "react-icons/fa";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES } from "@/utils/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {

  const {setSelectedChatType,setSelectedChatData,addChannel}=useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([])
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]); 
  const [channelName, setChannelName] = useState("")

  useEffect(()=>{
    const getData=async()=>{
      const response=await apiClient.get(GET_ALL_CONTACTS_ROUTES,{withCredentials:true});
       setAllContacts(response.data.contacts);
    }
    getData();
  },[])

 const createChannel=async()=>{
    try{
      if(channelName.length>0 && selectedContacts.length>0){
        const response = await apiClient.post(CREATE_CHANNEL_ROUTE,{
         name:channelName,members:selectedContacts.map((contact)=>contact.value),},{withCredentials:true});

         if(response.status===201){
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
         addChannel(response.data.channel);
         }
      } 
    
    } catch(error){
      console.log({error});

    }  
 }
 

  return (
    <>
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <FaPlus className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
      onClick={()=>setNewChannelModal(true)}
      />
    </TooltipTrigger>
    <TooltipContent
     className="bg-[#1c1b1e] border-none mb-2 p-3 text-white"
     >
      <p>Create New Channel</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

<Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
  <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
    <DialogHeader  className="flex flex-col ">
      <DialogTitle>  Please fill up the details for new channel.</DialogTitle>
      <DialogDescription></DialogDescription>
    </DialogHeader>
    <div >
     <Input placeholder="Channel Name" className="rounded-lg p-6 bg-[#2c2e3b] border-none "
       onChange= {(e)=>setChannelName(e.target.value)}
        value={channelName}
     />
    </div>
    <MultipleSelector className="rounded bg-[#2c283b] border-none text-white "
      defaultOptions={allContacts}
      placeholder="Search Contacts"
      value={selectedContacts}
      onChange={setSelectedContacts}
      emptyIndicator={
         <p className="text-center text-lg leading-10 text-gray-600">
          No results Found
         </p>
      }
    />
     <div>
      <Button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
        onClick={createChannel}
      >
        Create Channel
       </Button>
     </div>
  </DialogContent>
</Dialog>


    </>
  )
}

export default CreateChannel