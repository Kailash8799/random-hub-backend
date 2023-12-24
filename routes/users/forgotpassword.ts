require('dotenv').config()
import express from 'express'
import User from '../../models/User';
import jwt from "jsonwebtoken";
import sendMail from '../../middleware/email';
import { forgotpasswordemailtemp } from '../../constants/template/forgotemail';
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        if (req.method !== "POST") {
            res.json({ success: false, message: "Some error occured!" });
            return;
        }
        const { email } = req.body;
        if (email === undefined) {
            res.json({ success: false, message: "Email not valid" });
            return;
        }
        const olduser = await User.findOne({ email });
        if (!olduser) {
            res.json({ success: false, message: "No user found with this email" });
            return;
        }
        const token = jwt.sign({ id: olduser?._id, email: olduser?.email, success: true }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: "HS384" });
        const htmlemail = await forgotpasswordemailtemp(token);
        const email_responce = await sendMail({ htmlemail: htmlemail, subject: "Reset password", to_email: email })
        if (email_responce) {
            res.json({ success: true, message: "Email sent successfully" });
            return;
        } else {
            res.json({ success: false, message: "Some error occured! while sending email" });
            return;
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Some error occured!" }).status(401);
        return;
    }
})

export default router