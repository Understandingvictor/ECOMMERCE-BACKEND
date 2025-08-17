import {userModel} from "../models/users.model.js";
const isAdmin = async (req, res, next) => {
  try {
    const {userId} = req.user;
    if (!userId) {
      throw new Error("user ID not found");
    }
    const foundUser = await userModel.findById(userId); //looking for the user in DB
    if (foundUser.isAdmin === false) {
      throw new Error("permission denied");
    }
    next(); //proceed
  } catch (error) {
    console.log("something happened in isadmin section of middleware");
    next(error);
  }
};
export default isAdmin;
