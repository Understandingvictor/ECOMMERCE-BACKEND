import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    orders:[{
        type:mongoose.Schema.ObjectId,
        ref:'Orders'
    }],
    cart:{
        type:mongoose.Schema.ObjectId,
        ref:'Carts'
    }
})

const userModel = mongoose.model("Users", userSchema);

export {userModel};
