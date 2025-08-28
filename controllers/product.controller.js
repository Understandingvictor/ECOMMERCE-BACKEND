import { productModel } from "../models/product.model.js";
import { cartModel } from "../models/cart.model.js";
import { userModel } from "../models/users.model.js";
import { orderModel } from "../models/orders.model.js";
import { guestCartModel } from "../models/guestCartModel.js";
import { cloudinaryUploader } from "../helpers/cloudinary.helper.js";
import { getUserId } from "../helpers/functions.js";
import crypto from "crypto";
import fs from "fs/promises";

//get all products listings according to product owner, category
const getProducts = async (req, res, next) => {
  try {
    const query = {}; //query object
    let products;
    const { category } = req.query;

    if (category) {
      query.category = category;
      products = await productModel.find(query);
      return res.json({
        products: products,
        message: `${products.length} fetched successfully`,
      });
    }
    products = await productModel.find();
    return res.json({
      products: products,
      message: `${products.length} fetched successfully`,
    });
  } catch (error) {
    next(error);
  }
};

//endpoint for getting a particular product
const getAproduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productModel
      .findById(productId)
      .populate({ path: "productOwner", select: "_id" }); //return the product
    if (!product) {
      throw new Error("product not found");
    }
    return res.json({
      product: product,
      message: `product fetched successfully`,
    });
  } catch (error) {
    next(error);
  }
};

//endpoint for adding of products
const addProduct = async (req, res, next) => {
  let pictures;
  try {
    const userID = req.user;
    const payload = req.body;
    pictures = req.files;
    let secure_urls = [];

    if (!pictures && !payload) {
      throw new Error("add product and pictures pls");
    }

    for (let i of pictures) {
      const response = await cloudinaryUploader(i.path, "Product-Images"); //uploader
      if (!response) {
        await fs.unlink(i.path);
        throw new Error("upload not successful");
      }
      secure_urls.push(response["secure_url"]);
    }

    payload["images"] = secure_urls; //modified payload

    const newProduct = await new productModel({
      ...payload,
      productOwner: userID.userId,
    }).save(); //new product created successfully
    return res.json({ newProduct: newProduct, message: "added successfully" });
  } catch (error) {
    if (pictures) {
      //checking if picture exists
      for (let i of pictures && pictures.length !== 0) {
        await fs.unlink(i.path);
      }
    }
    next(error);
  }
};

//endpoint for updating of product for admin
const updateProduct = async (req, res, next) => {
  let pictures;
  try {
    const payload = req.body; //checks for object
    pictures = req.files; //checks for files
    const { productId } = req.params;

    if (!payload || !productId) {
      throw new Error("data doesnt exist");
    }

    if (pictures.length !== 0) {
      //checks if picture is available
      for (let picture of pictures) {
        const result = await cloudinaryUploader(picture.path, "POST-PICTURES");
        if (!result) {
          await fs.unlink(picture.path);
          throw new Error("upload not successful");
        }
        secureUrls.push(result["secure_url"]);
      }
      //modify payload to include pointers to images in the database
      payload["images"] = secureUrls;
    }

    const foundProduct = await productModel.findById(productId);
    if (!foundProduct) {
      throw new Error("product not found");
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      payload,
      { new: true }
    );
    return res.json({
      updatedProdut: updatedProduct,
      formerProduct: foundProduct,
      message: "updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//endpoint for adding to cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cookie = req.cookies;

    let variableQty = 1;
    if (quantity) {
      variableQty = quantity;
    }

    //if user is logged IN, which means token is now available
    if (cookie?.token){
      const token = cookie.token
      const userID =  getUserId(token);

      const cart = await cartModel.findOne({user:userID})
      if (cart){
        const productExists = cart.items.find((element) => element.product.toString() === productId.toString())
        if (productExists){ //updating quantity if product already exist in users cart
          const updatedCart = await cartModel.findOneAndUpdate({_id:cart.id, "items.product":productId},
          {$inc:{"items.$.quantity":variableQty}}, {new:true});
          return res.json({ cart: updatedCart, message: "added quantity successfully" });
        }

        //updating the current users cart if the product doesnt exist
        const updatedCart = await cartModel.findByIdAndUpdate(cart.id, { $push:{items:{product:productId, quantity:quantity}}}, {new:true})
        return res.json({ cart: updatedCart, message: "product added successfully" });
     }

     //creating new cart if a user doesnt have cart already and updating the user's cart field
     const newCart = await (new cartModel({user:userID, items:{product:productId, quantity:quantity}})).save();
     const updatedUser = await userModel.findByIdAndUpdate(userID, {cart:newCart.id}, {new:true})
     return res.json({cart:newCart, message:"main user cart created successfully"});
    }

    else if (!cookie?.guestId) {
     const guestId = crypto.randomUUID(); //generating random guest id

      //creating new cart if a user doesnt have cart already and updatiing the user's cart field
      const newCart = await new guestCartModel({user: guestId, items: { product: productId, quantity: quantity },}).save();

      //once new cart is created for guest user, a cookie for the guest is set
      return res
        .cookie("guestId", guestId, {
          maxAge: 1200000 * 24,
          secure: true,
          httpOnly: true,
          sameSite: "strict",
        })
        .json({
          cart: newCart,
          message: "guest cart created successfully",
        });
    } 

    //this blocks runs when theres no user logged in user but the guest user exists
    else {
      const cookie = req.cookies; //user id from guest user id
      const userID = cookie?.guestId;
      const cart = await guestCartModel.findOne({ user: userID });

      //if cart exists for the user then run this block
      if (cart) {
        const productExists = cart.items.find(
          (element) => element.product.toString() === productId.toString()
        );

        //updating quantity if product already exist in users cart
        if (productExists) {
          const updatedCart = await guestCartModel.findOneAndUpdate(
            { _id: cart.id, "items.product": productId },
            { $inc: { "items.$.quantity": variableQty } },
            { new: true }
          );
          return res.json({cart: updatedCart, message: "added quantity successfully"});
        }

        //updating the current users cart if the product doesnt exist
        const updatedCart = await guestCartModel.findByIdAndUpdate(
          cart.id,
          { $push: { items: { product: productId, quantity: quantity } } },
          { new: true }
        );
        return res.json({cart: updatedCart,message: "product added successfully"});
      }

      //creating new cart if a user doesnt have cart already and updatiing the user's cart field
      const newCart = await new guestCartModel({
        user: userID,
        items: { product: productId, quantity: quantity },
      }).save();

      //const updatedUser = await guestUserModel.findByIdAndUpdate(userID.userId, {cart:newCart.id}, {new:true})
      return res.json({cart: newCart, message: "created successfully"});
    }
  } catch (error) {
    next(error);
  }
};


//endpoint making an order and updating users account
const makeOrder = async (req, res, next) => {
  try {
    const userID = req.user;
    const itemArrays = [];
    
    const userCart = await cartModel.findOne({ user: userID.userId });
    if (!userCart) {
      throw new Error("no cart cart found pls add to cart");
    }
    for (let item of userCart.items) {
      itemArrays.push(item);
    }

    //new order
    const newOrder = await new orderModel({
      user: userID.userId,
      items: [...userCart.items],
    }).save();

    //updated user
    const updatedUser = await userModel.findByIdAndUpdate(
      userID.userId,
      { $push: { orders: newOrder } },
      { new: true }
    );

    //delete cart and update userModel
    const deletedCart = await cartModel.findOneAndDelete({user: userID.userId,}); //deletting the cart after order is made

    const updatedCartUser = await userModel.findByIdAndUpdate(
      userID.userId,
      { $unset: { cart: "" } },
      { new: true }
    );

    return res.json({
      order: newOrder,
      // updatedUser: updatedUser,
      // updatedCartUser: updatedCartUser,
      // deletedCart: deletedCart,
      message: "order created",
    });
  } catch (error) {
    next(error);
  }
};

//endpoint for deleting product
const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw new Error("product id is not found");
    }
    const foundProduct = await productModel.findById(productId);
    if (!foundProduct) {
      throw new Error("product not found");
    }
    const deletedProduct = await productModel.findOneAndDelete({
      _id: productId,
    });
    return res.json({
      deletedProduct: deletedProduct,
      message: "deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  addToCart,
  makeOrder,
  addProduct,
  updateProduct,
  deleteProduct,
  getAproduct,
};