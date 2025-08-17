import express from "express";
const app = express();
import cookieParser from "cookie-parser"
import mongoose from "mongoose";
import dotenv from "dotenv";
import usersRoute from './routes/users.route.js';
import logRoute from './routes/login.route.js';
import productRoute from './routes/product.route.js';
import orderRoute from './routes/order.route.js';


dotenv.config();
const port = process.env.PORT || 8000;

//mongoose connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("database active"))
  .catch((error) => console.log(error.message));

//data middlewares
app.use(express.json());
app.use(cookieParser())
app.use(usersRoute);
app.use(logRoute);
app.use(productRoute);
app.use(orderRoute);

//universal error handling middleware.
app.use((error, req, res, next) => {
  return res
    .status(error.status || 501)
    .json({ message: error.message || "something went wrong" });
});

app.listen(port, () => {
  console.log(`server active on port ${port}`);
});
