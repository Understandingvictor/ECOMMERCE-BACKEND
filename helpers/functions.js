import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
import { productModel } from "../models/product.model.js";
import { guestCartModel } from "../models/guestCartModel.js";
import { cartModel } from "../models/cart.model.js"
import { userModel } from "../models/users.model.js";

//this fuinction is used to get the current user's Id
const getUserId = (token)=>{
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded.userId;
  } catch (error) {
      const err = new Error("Invalid token");
      err.status = 401;
      throw err;
  }

}


//this function is used to calculate items in the cart

const cartTotalAmount = async (userId, whichUser) => {
  
  let amount = 0;

  if (whichUser === "guestUser") {
    const guestCart = await guestCartModel.findOne({ user: userId });
    if (!guestCart) {
      throw new Error('error!')
    }
    
    for (let item of guestCart.items) {
    const product = await productModel.findById(item.product);
      if (!product) continue;
      amount += product.price * item.quantity;
    }
  }

  if (whichUser === "mainUser") {
    const mainUserCart = await cartModel.findOne({ user: userId });
    if (!mainUserCart) {
      throw new Error("error!");
    } 
    //console.log(mainUserCart.items,"is the main user cart")
    
    for (let item of mainUserCart.items) {
      const product = await productModel.findById(item.product);
      if (!product) continue;
      amount += product.price * item.quantity;

    }      
  }
  return amount;
}

//fucntion that runs when the loggged in user has added to cart before logging in in the login controller
const guestChecking = async (guestId, res, payload) => {
  try {
    /*check if the person making order is guest
            takes the guest cart and creates a new cart for the logged in user
            updates the  cart model and deletes the guest cart
            updates the cart field of the user instance*/

    const foundGuestCart = await guestCartModel.findOne({ user: guestId }); //this is used to find the guest cart
    const user = await userModel.findById(payload.userId);
    if (!foundGuestCart || !user) {
      throw new Error(
        "something went wrong, guest cart not found main user not found"
      );
    }

    //if the guest have a cart meaning he's a bonafide member. he has logged in before, added to cart,
    // logged out and then became a guest and then logged again. EXECUTE THIS BLOCK
    if (user.cart) {
      const cart = await cartModel.findOne({ user: user.id }); //grab the main cart of the user turned guest
      if (!cart) {
        throw new Error(
          "something went wrong trying to find cart for user turned guest"
        );
      }
      for (let item of foundGuestCart.items) {
        //look up to check if product exixts in the user turned guest main cart
        const productExists = cart.items.find(
          (element) => element.product.toString() === item["product"].toString()
        );

        //updating quantity if product already exist in users cart
        if (productExists) {
          const updatedCart = await cartModel.findOneAndUpdate(
            { _id: cart.id, "items.product": item["product"] },
            { $inc: { "items.$.quantity": item.quantity } },
            { new: true }
          );
        } else if (!productExists) {
          //updating the current users cart if the product doesnt exist
          const updatedCart = await cartModel.findByIdAndUpdate(
            cart.id,
            {
              $push: {
                items: { product: item["product"], quantity: item.quantity },
              },
            },
            { new: true }
          );
        }
      }
      //delete guest cart
      const deletedGuestCart = await guestCartModel.findOneAndDelete({
        user: guestId,
      });

      //clear guset cookie to show guest is now a bonafide member
      res.clearCookie("guestId", {
        maxAge: 1200000 * 24,
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });

      //set main user cookie
      return res
        .cookie("token", token, {
          maxAge: 1200000 * 24,
          secure: true,
          httpOnly: true,
          sameSite: "strict",
        })
        .json({ message: "logged in successfully" });
      //await cartModel.findByIdAndUpdate(payload.userId, {cart:{items}}, {new:true});
    }

    //run this block if guest doesnt have a main cart befor
    const newCart = await new cartModel({
      user: payload.userId,
      items: foundGuestCart.items,
    }).save(); //creates a regular cart instance
    const updatedUser = await userModel.findByIdAndUpdate(
      payload.userId,
      { cart: newCart.id },
      { new: true }
    ); //update the user cart field  from regular cart

    //delete guest cart and clear cookies
    const deletedGuestCart = await guestCartModel.findOneAndDelete({
      user: guestId,
    });
    res.clearCookie("guestId", {
      maxAge: 1200000 * 24,
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    }); //clear guuet cookie to show guest is now a bonafide member
  } catch (error) {
    throw error; //hope this is correct
  }
        
}

export { getUserId, guestChecking, cartTotalAmount };