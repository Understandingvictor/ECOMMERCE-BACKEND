import { orderModel } from "../models/orders.model.js";



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


//customers view their own orders here
const customersViewOrders = async (req, res, next) => {
  try {
    const { userId } = req.user; //this is going to come from jwt
    if(!userId){
      throw new Error('user Id not found');
    }
    const orders = await orderModel.find({ user: userId }) //returns a list of things in your orders db
    .populate({path:'items', populate:{path:'product', select:"name price images -_id"}});
    return res.json({ orders: orders, message: "fetched successfully" });
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
};
