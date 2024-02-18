import { Userprops } from "../constants/props/user";
import User from "../models/User";
import { redisClient } from "./client";

async function addUserToRedis(user: Userprops) {
    try {
        await redisClient.hset(`user:${user.email}`, user);
        await redisClient.expire(`user:${user.email}`, 60 * 60 * 3);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

async function verifyUserinRedis({ email }: { email: string }) {
    try {
        const inRedis = await redisClient.hgetall(`user:${email}`);
        if (!inRedis) {
            const olduser = await User.findOne({ email });
            if (olduser === null || olduser === undefined) {
                return false;
            }
            const user: Userprops = {
                name: (olduser?.username) as string,
                email: (olduser?.email) as string,
                gender: (olduser?.gender) as string,
                location: (olduser?.location) as string,
                premiumuser: (olduser?.premiumuser) as string,
                interest: (olduser?.interest) as string,
            }
            addUserToRedis(user);
        }
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

export { addUserToRedis, verifyUserinRedis };