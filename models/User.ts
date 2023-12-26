import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        required: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        default: "OTHER"
    },
    location: {
        type: String,
        default: "WORLD"
    },
    premiumuser: {
        type: Boolean,
        default: false,
    },
    interest: {
        type: String,
        default: "ALL"
    },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model("User", UserSchema);