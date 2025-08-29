import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'Users'
    },
    items:[
        {
            product:{
                type:mongoose.Schema.ObjectId,
                ref:'Products'
            },
            quantity:{
                type:Number,
                default:1,
                min:1
            }
        }
    ],
    totalAmount: {
        type:Number
    },
    
    status:{
        type:String,
        enum:['pending', 'delivered'],
        default:'pending'
    }
  
}, {timestamps:true})
  

const orderModel = mongoose.model("Orders", orderSchema);

export {orderModel};
