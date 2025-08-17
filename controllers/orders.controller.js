import { orderModel } from "../models/orders.model.js";
import { userModel } from "../models/users.model.js";

//admin views whole orders here
const adminViewOrders = async (req, res, next) => {
  try {
    const orders = await orderModel
      .find()
      .populate("user")
      .populate("items.product");
    return res.json({ orders: orders, message: "fetched successfully" });
  } catch (error) {
    next(error);
  }
};

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
const customersViewOrders = async (req, res, next) => {
  try {
    const { userId } = req.user; //this is going to come from jwt
    if(!userId){
      throw new Error('user Id not found');
    }
    const orders = await orderModel.find({ user: userId }) //returns a list of things in your orders db
    .populate({path:'items', populate:{path:'product', select:"name price images"}});

    return res.json({ orders: orders, message: "fetched successfully" });
  } catch (error) {
    next(error);
  }
};

//customers view their own orders here
const customersViewCart = async (req, res, next) => {
  try {
    const { userId } = req.user; //this is going to come from jwt
    if (!userId) {
      throw new Error("user Id not found");
    }
    const userCart = await userModel.findById(userId).populate({
      path: "cart",
      populate: {
        path: "items.product",
        select: "name price  -_id",
      },
    });

    if (!userCart) {
      throw new Error("user not found");
    }
    else if(!userCart.cart){
      return res.json({message:"cart not found for user"});
    }

    return res.json({
      cart: userCart.cart.items,
      message: "users cart fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

//admin updates orders here
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;

    if ((status !== "delivered" && status !== "pending") || !orderId) {
      throw new Error("cannot interpret status");
    }
    const orderStatusUpdated = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { status: status },
      { new: true }
    );
    return res.json({
      updatedOrderStatus: orderStatusUpdated,
      message: "updated sucessfully",
    });
  } catch (error) {
    next(error);
  }
};
export {
  customersViewOrders,
  updateOrderStatus,
  adminViewOrders,
  customersViewCart,
  adminViewCart,
};
