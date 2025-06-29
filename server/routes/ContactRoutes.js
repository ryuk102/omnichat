import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { searchContacts,getContactsForDMList, getAllContacts } from "../controllers/ContactsController.js";

const contactRoutes=Router();

contactRoutes.post("/search",verifyToken,searchContacts);
contactRoutes.get("/getContactsForDM",verifyToken,getContactsForDMList);
contactRoutes.get("/getAllContacts",verifyToken,getAllContacts);

export default contactRoutes;