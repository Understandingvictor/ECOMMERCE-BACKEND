import {userModel} from "../models/users.model.js";
import {hashPassword} from "../helpers/passwordHashing.helper.js";

const createUser = async(req, res, next)=>{
    try {
        const payload = req.body;
        if (!payload.email || !payload.password) {
          throw new Error("enter email and password");
        }
        const existingUser = await userModel.findOne({
          $or: [{ email:payload['email'] }, { password:payload['password']}],
        }); //checking if email and username already exists $or is a mongo db syntax for that
        if (existingUser) {
          throw new Error("account exists");
        }
        const hashedPassword = hashPassword(payload.password);
        payload['password'] = hashedPassword; //modified payload
        const newUser = await (new userModel({email:payload.email, password:payload.password})).save();

        return res.json({message:'created successfully', newUser:newUser});
    } catch (error) {
        next(error);
    }
}
const getAllUsers= async(req, res, next)=>{
  try {
    const allUsers = await userModel.find().populate('cart');
    return res.json({users:allUsers, message:`${allUsers.length} fetched successfully`});
  } catch (error) {
    next(error)
  }
}
export {createUser, getAllUsers};