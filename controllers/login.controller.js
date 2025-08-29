import { unhashPassword } from "../helpers/passwordHashing.helper.js";
import { userModel } from "../models/users.model.js";
import { guestChecking } from "../helpers/functions.js";
import jwt from 'jsonwebtoken'; //this is used to create token and it is used at the login routes
import { hashPassword } from "../helpers/passwordHashing.helper.js";
import sendMail from "../helpers/email.helper.js";

//endpoint for logging in
const login = async (req, res, next) => {
  try {
    const query = {};
    const { email, password } = req.body;
    query.email = email;

    const user = await userModel.findOne(query);
    if (!user) {
      throw new Error("user not found");
    }
    const isCorrect = unhashPassword(password, user.password);
    if (!isCorrect) {
      const error = new Error("Invalid login");
      error.status = 401;
      throw error;
    }
    const payload = { userId: user.id };
    const options = { expiresIn: "24hr" };
    const token = jwt.sign(payload, process.env.SECRET_KEY, options);
    const { guestId } = req?.cookies; //checks if theres a cookie with name guestId

    //check if the person logging in has cart as guest
    if (guestId) {
      await guestChecking(guestId, res, payload, token);
    }
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
};

//endpoint for logging out
const logout = async (req, res, next) => {
  try {
    if (req.cookies?.guestId) {
      res.clearCookie("guestId", {
        httpOnly: true,
        path: "/", // Adjust based on how the cookie was originally set
        secure: true, // Use this if cookie was set with `secure: true`
        sameSite: "strict", // Match your original settings
      });
    }

    return res
      .clearCookie("token", {
        httpOnly: true,
        path: "/", // Adjust based on how the cookie was originally set
        secure: true, // Use this if cookie was set with `secure: true`
        sameSite: "strict", // Match your original settings
      })
      .json({ message: "logged out successfully" });
  } catch (error) {
    next(error);
  }
};

//endpoint for forgot password

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req?.body
    
    if (!email || !await userModel.findOne({ email: email }) ) {
      throw new Error("user not found or email address not found")
    }
    const user = await userModel.findOne({ email: email });
     const payload = { userId: user._id };
     const options = { expiresIn: "5m" };
    const token = jwt.sign(payload, process.env.PASSWORD_RECOVERY_SECRET_KEY, options);
    
    //your frontend page to insert new password replace with your FE and /the-exact-page
    const recoveryLink = `${process.env.FRONTEND}/testing.html?token=${token}`; 

    let mailOptions = {
      from: '"CHIF" <testingemailforsites@gmail.com>',
      to: email,
      subject: "PASSWORD RESET",
      html: `
          <p>hi ${email.split("@")[0]}</p>
          <h1>CLICK THE LINK BELOW TO RESET PASSWORD</h1>
          <a href="${recoveryLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            RESET PASSWORD
          </a>
      `,
    };
    await sendMail(mailOptions) //send the email

    return res.json({ message: "email sent"});
  } catch (error) {
    next(error)
  }
}

//endpoint for resetting password
const passwordReset = async (req, res, next) => {
  try {
    const { newPassword } = req?.body;
    const { token } = req?.query

    //console.log(newPassword, token);

    if (!newPassword || !token) {
      throw new Error('newPassword or token missing')
    }
    const decoded = jwt.verify(token, process.env.PASSWORD_RECOVERY_SECRET_KEY);
    const hashedPassword = hashPassword(newPassword);
    const user = await userModel.findByIdAndUpdate(decoded.userId, { password: hashedPassword }, { new: true });
    console.log(decoded);
    console.log(user);
    return res.json({message:"password reset successfully, now login"})
  } catch (error) {
     next(error);
  }
}

export { login, logout, forgotPassword, passwordReset };