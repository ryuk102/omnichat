import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store"
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, getColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ADD_PROFILE_IMAGE_ROUTE,REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_USER_PROFILE ,HOST} from "@/utils/constants";


const Profile = () => {
 const navigate=useNavigate();
 const {userInfo,setUserInfo}=useAppStore();
 const [firstName, setFirstName] = useState("");
 const [lastName, setLastName] = useState("");
 const [image, setImage] = useState(null);
 const [hovered, setHovered] = useState(false);
 const [selectedColor, setSelectedColor] = useState(0);
 
 const fileInputRef=useRef(null);
 
 
 useEffect(()=>{
  if(userInfo.profileSetup){
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setSelectedColor(userInfo.color);
  }
  if(userInfo.image){
    setImage(`${HOST}/${userInfo.image}`);
  }
 },[userInfo]);

 const validateProfile=()=>{
  if(!firstName){
    toast.error("FirstName is required");
    return false;       
  }
  if(!lastName){
    toast.error("lastName is required");
    return false;
  }
  return true;
 }

 const saveChanges=async()=>{
  if(validateProfile()){
    try{
      const response = await apiClient.post(UPDATE_USER_PROFILE, {
        firstName,
        lastName,
        color: selectedColor
      }, { withCredentials: true });
      
      if(response.status===200 && response.data){
        setUserInfo({...response.data});
        toast.success("Profile updated successfully");
        navigate("/chat");
      }
    }catch(error){
     console.log(error)
    }
  }
 };

const handleNavigate=()=>{
  if(userInfo.profileSetup){
    navigate("/chat");
  }else{
    toast.error("Please setup profile.")
  }
}

const handleFileInputClick=()=>{
  fileInputRef.current.click();
};

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("profile-image", file);

    try {
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
        withCredentials: true,
      });

      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        setImage(response.data.image);

        toast.success("Image updated successfully.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
    }
  }
};



const handleDeleteImage = async () => {
  try {
  
    const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
      withCredentials: true
    });

    if (response.status === 200) {
      setUserInfo({ ...userInfo, image: null });
      toast.success("Image removed successfully");
      setImage(null);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    toast.error("Failed to remove image");
  }
};



 return(
  <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
    <div className="flex flex-col gap-10 w-[80vw] md:w-max">
      <div onClick={handleNavigate}>
        <ArrowLeft className="text-4xl lg:text-6xl text-white/90 cursor-pointer"/>
      </div>
      <div className="grid grid-cols-2">
         <div className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
          onMouseEnter={()=>setHovered(true)}
          onMouseLeave={()=>setHovered(false)}
         >
          <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
            {
              image? (<AvatarImage
                src={image} alt="profile"
                className="object-cover w-full h-full bg-black"
              />):(
                 <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full  ${getColor(selectedColor)}`}>
                 {firstName
                   ? firstName.split("").shift()
                   :userInfo.email.split("").shift()}
                 </div>) 
            }

          </Avatar>
          {
            hovered &&(
              <div className="absolute insert-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
               onClick={image?handleDeleteImage:handleFileInputClick}
              >
                {image ? (
                  <Trash2 className="text-white text-3xl cursor-pointer"/>
                ):(
                  <Plus className="text-white text-3xl cursor-pointer"/>
                )}
              </div>
            )
          }
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} name="profile-image" accept=".png, .jpg, .jpeg, .svg, .webp"/>
         </div>
         <div className="flex min-w-32 md:min-64 flex-col gap-5 text-white items-center justify-center">
          <div className="w-full">
            <Input placeholder="Email" type="email" disabled value={userInfo.email} className="rounded-lg p-6 bg-[#2c2e3b] border-none"/>
          </div>
          <div className="w-full">
            <Input placeholder="First Name" type="text" onChange={(e)=>setFirstName(e.target.value)} value={firstName} className="rounded-lg p-6 bg-[#2c2e3b] border-none"/>
          </div>
          <div className="w-full">
            <Input placeholder="Last Name" type="text" onChange={(e)=>setLastName(e.target.value)} value={lastName} className="rounded-lg p-6 bg-[#2c2e3b] border-none"/>
          </div>
          <div className="w-full flex gap-5">
            {
              colors.map((color,index)=>(<div className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
              ${selectedColor===index ? " outline-white/50 outline-1":""}}
              `}
              key={index}
              onClick={()=>setSelectedColor(index)}
              >
              </div>
            ))}
          </div>
         </div>
      </div>
      <div className="w-full ">
        <Button className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
         onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  </div>
 );
};

export default Profile