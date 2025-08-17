import { unhashPassword } from "../helpers/passwordHashing.helper.js";
import { userModel } from "../models/users.model.js";
import jwt from 'jsonwebtoken'; //this is used to create token and it is used at the login routes


const login=async(req, res, next)=>{
     try {
        const query = {}
        const {email, password} = req.body;
        query.email = email;

        const user = await userModel.findOne(query);
        if(!user){
          throw new Error('user not found');
        }
        const isCorrect = unhashPassword(password, user.password);
        if (!isCorrect){
            const error = new Error("Invalid login");
            error.status = 401;
            throw error;
        }
        const payload = {userId:user.id}
        const options = {expiresIn:'24hr'}
        const token= jwt.sign(payload, process.env.SECRET_KEY, options);
        return res
          .cookie("token", token, {
            maxAge: 1200000 * 24,
            secure: true,
            httpOnly: true,
            sameSite: "strict",
          })
          .json({ message: "logged in successfully" });
    } catch (error) {
        next(error);
    }
}
export {login}