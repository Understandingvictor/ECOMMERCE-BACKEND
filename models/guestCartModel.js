import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user:{
        type:String
        //ref:'GuestUsers'
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
  

const guestCartModel = mongoose.model("guestCarts", cartSchema);

export {guestCartModel};
