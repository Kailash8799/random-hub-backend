import express from 'express'
import User from '../../models/User';
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        if (req.method !== "POST") {
            res.json({ success: false, message: "Some error occured!" });
            return;
        }
        const { username, email, password } = req.body;

        if (username === "" || email === "" || password === "") {
            res.json({ success: false, message: "email or password is empty" });
            return;
        }

        const olduser = await User.findOne({ email });
        if (olduser) {
            res.json({ success: false, message: "User already exits" });
            return;
        }

        var hashPassword = CryptoJS.AES.encrypt(password, process.env.PASSWORD_KEY).toString();

        const newuser = new User({
            name: username,
            email: email,
            password: hashPassword,
            emailVerified: false,
        })

        await newuser.save();
        const token = jwt.sign({ username, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, success: true, message: "Account created successfully!" });
        return;
    } catch (error) {
        res.json({ success: false, message: "Some error occured!" });
        return;
    }
})

export default router