import Background from "../../assets/login2.png"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Victory from "../../assets/victory.svg"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "@/store"


const Auth = () => {
  const navigate=useNavigate();
  const {setUserInfo}=useAppStore();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const validateLogin=()=>{
    if(!email.length){
      toast.error("Email is required.");
      return false;
    }
    if(!password.length){
      toast.error("password is required");
      return false;
    }
    return true;
  }

  const validateSignup=()=>{
    if(!email.length){
      toast.error("Email is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address.");
    return false;
  }
    if(password.length<6){
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if(password!==confirmPassword){
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  }


  const handlelogin = async () => {
    if(validateLogin()){
     
      try {
        const response = await apiClient.post(LOGIN_ROUTE, { email, password }, { withCredentials: true });
        if (response.data.user.id) {
          setUserInfo(response.data.user);
          navigate(response.data.user.profileSetup ? "/chat" : "/profile");
        }
      } catch (error) {
        toast.error("Invalid email or password.");
        console.error(error);
      }
    }

  };

  const handleSignup=async()=>{
    if(validateSignup()){
      try{
        const response=await apiClient.post(SIGNUP_ROUTE,{email,password},{withCredentials:true});
        if(response.status===201){
          setUserInfo(response.data.user)
          navigate("/profile");
          toast.success("User registered successfully");
          
        }
      }catch(error){
        if (error.response?.status === 409) {
          toast.error("Email already exists. Please log in instead.");
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        console.log({error});
      }
  }
};

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
               <h1 className="text-5xl font-bold md:text-6xl">welcome</h1>
              <img src={Victory} alt="Victoty image" className="h-[100px]"/>
            </div>
            <p className="font-medium text-center">Fill in the details to get started with Omnichat</p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="flex items-center justify-center w-full">
                <TabsTrigger className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300" value="login">Login</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300" value="signup">Signup</TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10 " value="login">
                <input placeholder="Email" type="email" className="rounded-full p-6" value={email} onChange={(e)=>setEmail(e.target.value)} ></input>  
                <input placeholder="Password" type="password" className="rounded-full p-6" value={password} onChange={(e)=>setPassword(e.target.value)} ></input> 
                <Button className="rounded-full p-6" onClick={handlelogin}> Login</Button>                       
              </TabsContent>
              <TabsContent className="flex flex-col gap-5" value="signup">
                <input placeholder="Email" type="email" className="rounded-full p-6" value={email} onChange={(e)=>setEmail(e.target.value)} ></input>  
                <input placeholder="Password" type="password" className="rounded-full p-6" value={password} onChange={(e)=>setPassword(e.target.value)} ></input> 
                <input placeholder="Confirm Password" type="password" className="rounded-full p-6" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} ></input>
                <Button className="rounded-full p-6" onClick={handleSignup}> signup</Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="background login" className="h-[500px]"/>
        </div>
      </div>
    </div>
  )
}

export default Auth