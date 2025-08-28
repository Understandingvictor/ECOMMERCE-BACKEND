import express from "express"
const route = express.Router();
import isAdmin from "../middlewares/isAdmin.middleware.js";
import verifyUser from "../middlewares/userAuth.middleware.js";
import { customersViewCart, adminViewCart } from "../controllers/cart.controller.js";

route.get("/customersViewCart", customersViewCart); //for geeting a customers cart. customer could be a guest or a main user
route.get("/adminViewCart", verifyUser, isAdmin, adminViewCart); //for getting customers cart. must be an admin and must be logged in

export default route;