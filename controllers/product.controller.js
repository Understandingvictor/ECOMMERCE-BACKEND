import { productModel } from "../models/product.model.js";
import { cartModel } from "../models/cart.model.js";
import { userModel } from "../models/users.model.js";
import { orderModel } from "../models/orders.model.js";
import { cloudinaryUploader } from "../helpers/cloudinary.helper.js";
import fs from "fs/promises"

//get all products listings according to product owner, category 
const getProducts= async(req, res, next)=>{
    try {
        const query = {} //query object
        let products;
        const {category} = req.query;

        if (category){
            query.category = category;
            products = await productModel.find(query);
            return res.json({products:products, message:`${products.length} fetched successfully`});
        }
        products = await productModel.find();
        return res.json({products:products, message:`${products.length} fetched successfully`});
    } catch (error) {
        next(error);
    }
}

//endpoint for getting a particular product
const getAproduct= async(req, res, next)=>{
    try {
      const {productId} = req.params
        const product = await productModel.findById(productId).populate({path:'productOwner', select:'_id'}); //return the product
        if(!product){
          throw new Error('product not found');
        }
        return res.json({product:product, message:`product fetched successfully`});
    } catch (error) {
        next(error);
    }
}


//endpoint for adding of products
const addProduct = async(req, res, next)=>{
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
          secure_urls.push(response['secure_url']);
        }

        payload['images'] = secure_urls //modified payload
        
        const newProduct =  await (new productModel({...payload, productOwner:userID.userId})).save(); //new product created successfully
        return res.json({newProduct:newProduct, message:"added successfully"})
    } catch (error) {
       if(pictures){ //checking if picture exists
             for(let i of pictures && pictures.length !== 0){ 
               await fs.unlink(i.path);
             }
           }
           next(error);
    }
}



//endpoint for updating of product
const updateProduct = async(req, res, next)=>{
  let pictures;
  try {
    const payload = req.body;//checks for object
    pictures = req.files; //checks for files
    const { productId } = req.params;

    if (!payload || !productId) {
      throw new Error("data doesnt exist");
    }


    if (pictures.length !== 0) { //checks if picture is available
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
}

//endpoint for adding to cart
const addToCart = async (req, res, next) => {
  try {
    const {productId, quantity}= req.body;

    let variableQty = 1;
    if (quantity){
      variableQty = quantity;
    }

    const userID = req.user; //user id from jwt
    const cart = await cartModel.findOne({user:userID.userId})

    if (cart){
          const productExists = cart.items.find((element) => element.product.toString() === productId.toString()) 
          if (productExists){ //updating quantity
            const updatedCart = await cartModel.findOneAndUpdate(
              {_id:cart.id, "items.product":productId}, 
              {$inc:{"items.$.quantity":variableQty}}, {new:true});
            return res.json({ cart: updatedCart, message: "added quantity successfully" });
          }

          //updating cart
        const updatedCart = await cartModel.findByIdAndUpdate(cart.id, { $push:{items:{product:productId, quantity:quantity}}}, {new:true})
        return res.json({ cart: updatedCart, message: "product added successfully" });
    }
    //creating new cart for user
    const newCart = await (new cartModel({user:userID.userId, items:{product:productId, quantity:quantity}})).save();
    const updatedUser = await userModel.findByIdAndUpdate(userID.userId, {cart:newCart.id}, {new:true})
    return res.json({cart:newCart, updatedUser:updatedUser, message:"created successfully"});
  } catch (error) {
    next(error);
  }
};


//endpoint making an order and updating users account
const makeOrder = async (req, res, next) => {
  try {
    const userID = req.user;
    const itemArrays = [];
    const userCart = await cartModel.findOne({user:userID.userId});
    if(!userCart) {
      throw new Error('no cart cart found pls add to cart');
    }
    for (let item of userCart.items){
      itemArrays.push(item);
    }
    const newOrder = await (new orderModel({user:userID.userId, items:[...userCart.items]})).save();//new order
    const updatedUser = await userModel.findByIdAndUpdate(userID.userId, {$push:{orders:newOrder}}, {new:true}); //updated user

    //delete cart and update userModel
    const deletedCart = await cartModel.findOneAndDelete({user:userID.userId}); //deletting the cart after order is made
    const updatedCartUser = await userModel.findByIdAndUpdate(userID.userId, {$unset:{cart:""}}, {new:true});

    return res.json({
      order:newOrder, 
      updatedUser:updatedUser, 
      updatedCartUser:updatedCartUser, 
      deletedCart:deletedCart,  
      message:"order created"});
  } catch (error) {
    next(error);
  }
};

//endpoint for deleting product
const deleteProduct = async(req, res, next)=>{
  try {
    const { productId } = req.params;
    if (!productId){
      throw new Error('product id is not found')
    }
    const foundProduct = await productModel.findById(productId);
    if (!foundProduct){
            throw new Error("product not found");
    }
    const deletedProduct = await productModel.findOneAndDelete({_id:productId});
    return res.json({deletedProduct:deletedProduct, message:"deleted successfully"});
  } catch (error) {
    next(error);
  }
}


export {
  getProducts,
  addToCart,
  makeOrder,
  addProduct,
  updateProduct,
  deleteProduct,
  getAproduct,
};