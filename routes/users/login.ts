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

        const { email, password } = req.body;
        console.log(email)
        console.log(password)
        if (email === undefined || password === undefined) {
            res.json({ success: false, message: "Invalid credentials" });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.json({ success: false, message: "Invalid credentials" });
            return;
        }

        var pword = CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_KEY);
        var originalpass = pword.toString(CryptoJS.enc.Utf8);
        if (originalpass !== password) {
            res.json({ success: false, message: "Invalid credentials" });
            return;
        }

        const token = jwt.sign({ data: 'foobar' }, 'secret', { expiresIn: '1h' });

        res.json({ token, success: true, message: "Login Successfull" });

    } catch (error) {
        res.json({ success: false, message: "Some error occured!" }).status(401);
        return;
    }
})

export default router