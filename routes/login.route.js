import express from "express";
import { login, logout, forgotPassword, passwordReset} from "../controllers/login.controller.js";

const route = express.Router();
route.post("/login", login); //for logging in
route.post("/logout", logout);//for logging out
route.post("/forgotPassword", forgotPassword);//forgot password endpoint
route.post("/passwordReset", passwordReset);//reset or recover password endpoint

//route.post("/clearGuestCookie", clearGuestCookie);

export default route;
