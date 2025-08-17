import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'Users'
    },
    items:[{
        product:{
            type:String,
            ref:'Products'
        },
        quantity:{
            type:Number,
            default:1,
            min:1
        }
    }]
  
}, {timestamps:true})
  

const cartModel = mongoose.model("Carts", cartSchema);

export {cartModel};
