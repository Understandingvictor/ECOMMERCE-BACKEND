import express from "express"
import isAdmin from "../middlewares/isAdmin.middleware.js";
import verifyUser from "../middlewares/userAuth.middleware.js";
import {
  adminViewOrders,
  customersViewOrders,
  updateOrderStatus,
} from "../controllers/orders.controller.js";

const route = express.Router();


route.get("/adminViewOrders", verifyUser, isAdmin,  adminViewOrders); //only admin views order. must be logged in 
route.get("/customersViewOrders", verifyUser, customersViewOrders); //only customers view orders. must be logged in
route.post("/updateOrderStatus", verifyUser, isAdmin, updateOrderStatus);//only admin updates status.must be logged in

export default route;
