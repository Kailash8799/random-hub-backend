import { ENV_VAR } from '../../constants/env';
import { contactproducer } from '../../kafka/producer';
import User from '../../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = ENV_VAR.JWT_SECRET

async function contactController(req, res) {
    try {
        if (req.method !== "POST") {
            res.json({ success: false, message: "Some error occured!" });
            return;
        }
        const { firstname, lastname, email, subject, message, token } = req.body;
        const decode = jwt.verify(token, JWT_SECRET);
        const { email: emailjwt } = decode as JwtPayload;

        const olduser = await User.findOne({ email: emailjwt });
        if (olduser === null || olduser === undefined) {
            res.json({ success: false, message: "Invalid session please logout and login again!" });
            return;
        }
        contactproducer({
            userId: olduser._id,
            firstname,
            lastname,
            email,
            subject,
            message
        });
        res.json({ success: true, message: "Message sended successfully!" });
        return;

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Some error occured!" });
        return;
    }
}

export { contactController };