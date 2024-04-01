import express from 'express'
import User from '../../models/User';
import jwt, { JwtPayload } from "jsonwebtoken";
// import { verifyUserinRedis } from '../../redis/userauth';
import { ENV_VAR } from '../../constants/env';
const router = express.Router();

const JWT_SECRET = ENV_VAR.JWT_SECRET

router.post("/", async (req, res) => {
    try {
        if (req.method !== "POST") {
            res.json({ success: false, message: "Some error occured!" });
            return;
        }
        const { token } = req.body;
        const decode = jwt.verify(token, JWT_SECRET);
        const { email } = decode as JwtPayload;
        if (email === undefined || email === null) {
            res.json({ success: false, message: "Invalid session please logout and login again!" });
            return;
        }
        console.log(email)
        // const inRedis = await verifyUserinRedis({ email: email });
        const olduser = await User.findOne({ email }).select("gender location premiumuser username interest email -_id");
        console.log(olduser)
        if (!olduser) {
            res.json({ success: false, message: "Invalid session please logout and login again!" });
            return;
        }
        res.json({ success: true, message: "Profile fetched successfully", user: olduser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Some error occured!" });
        return;
    }
})

export default router