import express from "express";
import { getProducts, addToCart, makeOrder, addProduct, updateProduct, deleteProduct, getAproduct } from "../controllers/product.controller.js";
import multer from "multer";
const upload = multer({dest:'./uploads'});
import verifyUser from "../middlewares/userAuth.middleware.js";
import isOwner from "../middlewares/deletePermission.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";

const route = express.Router();
route.get("/getProducts", getProducts); //retrieves all the product
route.get("/productPage/:productId", getAproduct); //gets a particular product by entering the product id
route.post("/addProduct", upload.array("product-image", 3), verifyUser, isAdmin, addProduct); //endpoint for adding a product, must be an admin
route.put("/updateProduct/:productId", upload.array("product-image", 3), verifyUser, isOwner, isAdmin, updateProduct); //endpoin for updating product 
route.post("/addToCart", addToCart);    //end point to adding to cart as either a guest or main user
route.post("/makeOrder", verifyUser, makeOrder); //endpoint to making an order, user must be logged in
route.delete("/deleteProduct/:productId", verifyUser, isOwner, isAdmin, deleteProduct); //endpoint for deleting a product


export default route;
