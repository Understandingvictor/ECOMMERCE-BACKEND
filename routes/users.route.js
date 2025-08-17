import express from "express";
import isAdmin from "../middlewares/isAdmin.middleware.js";
import verifyUser from "../middlewares/userAuth.middleware.js";
import { createUser, getAllUsers } from "../controllers/users.controller.js";

const route = express.Router();
route.post('/createUser', createUser);
route.get("/getAllUsers/", verifyUser, isAdmin, getAllUsers);

export default route;