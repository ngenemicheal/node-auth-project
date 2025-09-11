const { required } = require("joi");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required!"],
            trim: true,
            unique: [true, "Email already taken!"],
            minLength: [5, "Email must have atleast 5 characters!"],
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required!"],
            trim: true,
            select: false,
            minLength: [5, "Password must have atleast 8 characters!"],
        },
        verified: {
            type: Boolean,
            default: false,
        },
        verificationCode: {
            type: String,
            select: false,
        },
        verificationCodeValidation: {
            type: Number,
            select: false,
        },
        forgotPasswordCode: {
            type: String,
            select: false,
        },
        forgotPasswordCodeValidatio: {
            type: Number,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
