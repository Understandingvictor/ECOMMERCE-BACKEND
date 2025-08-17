import express from "express";
import { getProducts, addToCart, makeOrder, addProduct, updateProduct, deleteProduct, getAproduct } from "../controllers/product.controller.js";
import multer from "multer";
const upload = multer({dest:'./uploads'});
import verifyUser from "../middlewares/userAuth.middleware.js";
import isOwner from "../middlewares/deletePermission.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";

const route = express.Router();
route.get("/getProducts", getProducts);
route.get("/productPage/:productId", getAproduct);
route.post("/addToCart", verifyUser, addToCart);
route.post("/makeOrder", verifyUser, makeOrder);
route.put("/updateProduct/:productId", verifyUser, isOwner, updateProduct);
route.delete("/deleteProduct/:productId", verifyUser, isOwner, deleteProduct);
route.post("/addProduct/", upload.array("product-image", 3), verifyUser, isAdmin, addProduct);


export default route;
