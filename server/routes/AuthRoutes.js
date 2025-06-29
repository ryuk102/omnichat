import { Router } from "express";
import { removeProfileImage,addProfileImage,updateProfile,getUserInfo, login,signup,logout } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes=Router();
const upload=multer({dest:"uploads/profiles"})

authRoutes.post("/signup",signup);
authRoutes.post("/login",login)
authRoutes.get("/userInfo",verifyToken,getUserInfo);
authRoutes.post("/updateProfile",verifyToken,updateProfile);
authRoutes.post("/addProfileImage",verifyToken,upload.single("profile-image"),addProfileImage);
authRoutes.delete("/removeProfileImage",verifyToken,removeProfileImage);
authRoutes.post("/logout",logout)

export default authRoutes;