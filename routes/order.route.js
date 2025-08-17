import express from "express"
import isAdmin from "../middlewares/isAdmin.middleware.js";
import verifyUser from "../middlewares/userAuth.middleware.js";
import {
  adminViewOrders,
  customersViewOrders,
  updateOrderStatus,
  customersViewCart,
  adminViewCart,
} from "../controllers/orders.controller.js";

const route = express.Router();


route.get("/adminViewOrders", verifyUser, isAdmin,  adminViewOrders);
route.get("/customersViewCart", verifyUser, customersViewCart);
route.get("/adminViewCart", verifyUser, isAdmin, adminViewCart);
route.get("/customersViewOrders", verifyUser, customersViewOrders);
route.post("/updateOrderStatus", verifyUser, isAdmin, updateOrderStatus);

export default route;
