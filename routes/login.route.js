import express from "express";
import { login } from "../controllers/login.controller.js";

const route = express.Router();
route.post("/login", login);

export default route;
