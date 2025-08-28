import nodemailer from "nodemailer"
import dotenv from 'dotenv';
dotenv.config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});


const sendMail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        return info.response;
    } catch (error) {
        throw error
    }
}


export default sendMail;