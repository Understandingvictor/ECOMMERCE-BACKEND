import { getUserId } from "../helpers/functions.js";
import { guestCartModel } from "../models/guestCartModel.js";
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
      if (await guestCartModel.find({user:guestId})){
        const foundCart = await guestCartModel.find({user:guestId})
        .populate('user')
          .populate({ path: "items.product", select: "name price  -_id" })
        if (!foundCart) {
          throw new Error('cart is not found for this guest');
        }
        
        //calculate total amount in cart
        const totalPrice = await cartTotalAmount(guestId, "guestUser");
        return res.json({cart:foundCart, totalPrice:totalPrice,  message:"fetched successfully"})
      }
      else{
        throw new Error('something went wrong');
      }
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
export {customersViewCart, adminViewCart}