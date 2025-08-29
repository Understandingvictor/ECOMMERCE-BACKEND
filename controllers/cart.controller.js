import { getUserId } from "../helpers/functions.js";
import { guestCartModel } from "../models/guestCartModel.js";
import { cartModel } from "../models/cart.model.js";
import { userModel } from "../models/users.model.js";
import { cartTotalAmount } from "../helpers/functions.js";


//admin views whole cart here
const adminViewCart = async (req, res, next) => {
  try {
    const users = await userModel
      .find().populate({path: "cart", populate: { path: "items.product", select: "name price -_id" }});
      
    const carts = users.map((user) => user.cart?.items).filter((cart) => cart != null); //gets carts and filters cart
    return res.json({
      carts: carts,
      message: ` ${carts.length} fetched successfully `,
    });
  } catch (error) {
    next(error);
  }
};
//customers view their own orders here
const customersViewCart = async (req, res, next) => {
  try {
    const cookie = req.cookies; //this is going to come from jwt
    const token  = cookie?.token; //get token from cookie 
    const guestId  = cookie?.guestId; //get guestId from cookie 
  
    //runs this block if theres no token meaning the current user is a guest user
    if (guestId){
        const foundCart = await guestCartModel
          .findOne({ user: guestId })
          .populate({ path: "items.product", select: "name price  -_id" })
          .select("-_id -user"); 
        if (!foundCart) {
          throw new Error('cart is not found for this guest');
      }
        //calculate total amount in cart
        const totalPrice = await cartTotalAmount(guestId, "guestUser");
        return res.json({cart:foundCart, totalPrice:totalPrice,  message:"guest cart fetched successfully"})
    }

    //if theres no cookie for guest user meaning the request comming here is not from a guest but a logged in user,
    //  execute here
    if (token){
      const userId = await getUserId(token); //get the user id  from cookies

      if (!userId) {
        throw new Error("user Id not found");
      }
      const user = await userModel.findById(userId).populate({path: "cart",populate: {path: "items.product",
          select: "name price  -_id",
        },
      });

      if (!user) {
        throw new Error("user not found");
      }
      else if(!user.cart){
        return res.json({message:"cart not found for user"});
      }
      
      //calculate total amount in cart
      const totalPrice = await cartTotalAmount(userId, "mainUser");
      return res.json({
        cart: user.cart.items,
        totalPrice:totalPrice,
        message: "users cart fetched successfully",
      });
    }
    return res.json({message:"empty cart, pls add product to view cart"});
  } catch (error) {
    console.log("errow happened in customer view cart")
    console.log(error.message);
    next(error);
  }
};

//this endpoint is for removing prodcut from cart
const removeProductFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params
    const {guestId, token } = req.cookies
    if (!productId) {
      throw new Error("product id doesnt exist")
    }
  
   
    if (guestId) {
      //find the cart
      const cart = await guestCartModel.findOne({ user: guestId });
      if (!cart) {
        throw new Error("something went wrong")
      }
      const lengthBefore = cart.items.length; //cart length before
      //check if product exists
      const productExists = cart.items.find(
        (element) => element.product.toString() === productId.toString()
      );

      if (productExists) {
        const updatedCart= await guestCartModel.findOneAndUpdate({user:guestId}, { $pull: { items: { product: productId } } }, { new: true })
        
        const lengthAfter = updatedCart.items.length; //cart length after

        if (lengthAfter < lengthBefore) {
          return res.json({ message: "Removed from cart" });
        } else {
          throw new Error("Product not found in cart");
        }
      }
      else {
        return res.json({message:"product doesnt exist"})
      }
    }

    //runs when token exists meaning when user is logged in
    else if (token) {
      const userId = getUserId(token);

      //find the cart
      const cart = await cartModel.findOne({ user: userId });
      if (!cart || !userId) {
        throw new Error("something went wrong");
      }

      const lengthBefore = cart.items.length; //cart length before
  
      //check if product exists
      const productExists = cart.items.find(
        (element) => element.product.toString() === productId.toString()
      );

      if (productExists) {
        const updatedCart = await cartModel.findOneAndUpdate(
          { user:userId },
          { $pull: { items: { product: productId } } },
          { new: true }
        );
    
        const lengthAfter = updatedCart.items.length; //cart length after

        if (lengthAfter < lengthBefore) {
          if (updatedCart.items.length === 0) {//unsetting the cart field of the user
                  await userModel.findByIdAndUpdate(
                  userId,
                  { $unset: { cart: "" } },
                  { new: true }
                );
          }
          return res.json({ message: "Removed from cart" });
        } else {
          throw new Error("Product not found in cart");
        }
      }
      else {
        return res.json({ message: "product doesnt exist" });
      }
    }
    else {
      throw new Error("something went wrong")
    }
  } catch (error) {
    next(error);
  }
}
export { customersViewCart, adminViewCart, removeProductFromCart };