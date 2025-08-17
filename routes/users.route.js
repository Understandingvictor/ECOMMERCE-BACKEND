import express from "express";
import isAdmin from "../middlewares/isAdmin.middleware.js";
import { createUser, getAllUsers } from "../controllers/users.controller.js";

const route = express.Router();
route.post('/createUser', createUser);
route.get("/getAllUsers/:userId", isAdmin, getAllUsers);

export default route;