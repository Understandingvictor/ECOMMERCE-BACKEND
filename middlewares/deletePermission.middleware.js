//import postModel from "../models/post.model.js";
import { productModel } from "../models/product.model.js";
import {userModel} from "../models/users.model.js";
const isOwner = async (req, res, next) => {
  try {
    const {userId} = req.user;
    const { productId } = req.params;
    if (!userId || !productId) {
      throw new Error("user ID or post ID not found");
    }

    const foundUser= await userModel.findById(userId); //we find the user
    const foundProduct = await productModel.findById(productId); //we find the proct

    if(!foundUser || !foundProduct){
      throw new error('no user found or product not found')
    }

    //we check if the user sending request is the product owner
      if (foundProduct.productOwner.toString() === userId.toString() ||foundUser.isAdmin === true) {
        next();
      } else {
        throw new Error("you are not the owner of this product"); //we return error here
      }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export default isOwner;
