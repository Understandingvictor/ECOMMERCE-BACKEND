import express from "express";
import isAdmin from "../middlewares/isAdmin.middleware.js";
import verifyUser from "../middlewares/userAuth.middleware.js";
import { createUser, getAllUsers } from "../controllers/users.controller.js";

const route = express.Router();
route.post('/createUser', createUser); //for creating of a new user
route.get("/getAllUsers", verifyUser, isAdmin, getAllUsers);//for getting all registered user. must be an admin and must be logged in

export default route;