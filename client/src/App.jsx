import { React,children, useEffect} from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Auth from './pages/auth/AuthPage'
import Chat from './pages/chat/ChatPage'
import Profile from './pages/profile/ProfilePage'
import { useAppStore } from './store'
import { apiClient } from './lib/api-client'
import { GET_USER_INFO } from './utils/constants'
import { useState } from 'react'

const PrivateRoute=({children})=>{
    const {userInfo}=useAppStore();
    const isAuthenticated=!!userInfo;
    return isAuthenticated ? children:<Navigate to="/auth"/>
}

const AuthRoute=({children})=>{
  const {userInfo}=useAppStore();
  const isAuthenticated=!!userInfo; //double negation converts "userInfo" into boolean
  return isAuthenticated ?<Navigate to="/chat"/>:children;
}




const App = () => {
  const {userInfo,setUserInfo}=useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
   const getUserData=async()=>{
     try{

      const response =await apiClient.get(GET_USER_INFO,{withCredentials:true});
      
      if(response.status===200 && response.data.id){
        setUserInfo(response.data);
      }else{
        setUserInfo(null)
      }
     
     }catch(error){
      setUserInfo(null)
      console.log({error})
     }finally{
      setLoading(false);
     }
   };
   if(!userInfo  ){
    getUserData();
   }else{
    setLoading(false);
   }
  },[userInfo,setUserInfo]);

  if(loading){
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth" element={<AuthRoute> <Auth/> </AuthRoute>}/>
        <Route path="chat" element={<PrivateRoute> <Chat/> </PrivateRoute>}/>
        <Route path="profile" element={<PrivateRoute> <Profile/> </PrivateRoute>}/>
        
        <Route path="*" element={<Navigate to="/auth" />}/>
      </Routes>
    </BrowserRouter>
  )
}



export default App;


