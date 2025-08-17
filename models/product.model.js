import mongoose from "mongoose";
import { type } from "os";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    productOwner: {
      type: mongoose.Schema.ObjectId,
      ref:'Users'
    },
  },
  { timestamps: true }
);
  

const productModel = mongoose.model("Products", productSchema);

export {productModel};
