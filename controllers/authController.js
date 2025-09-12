const jwt = require("jsonwebtoken");
const {
    signupSchema,
    signinSchema,
    acceptCodeSchema,
    changePasswordSchema,
    acceptForgotPasswordCodeSchema,
} = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require("../middlewares/sendMail");

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password });

        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res
                .status(401)
                .json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new User({
            email,
            password: hashedPassword,
        });
        const result = await newUser.save();
        result.password = undefined;

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            result,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { error, value } = signinSchema.validate({ email, password });

        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email }).select("+password");

        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: "User does not exist" });
        }

        const result = await doHashValidation(password, existingUser.password);

        if (!result) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
            },
            process.env.TOKEN_SECRET,
            { expiresIn: "8h" }
        );

        res.cookie("Authorization", "Bearer " + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production",
        })
            .status(200)
            .json({
                success: true,
                message: "Login successfully",
                token,
            });
    } catch (error) {
        console.log(error);
    }
};

exports.logout = async (req, res) => {
    res.clearCookie("Authorization").status(200).json({
        success: true,
        message: "User logged out successfully",
    });
};

exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: "User does not exist" });
        }

        if (existingUser.verified) {
            return res
                .status(400)
                .json({ success: false, message: "User already verified" });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.SMTP_EMAIL_USER,
            to: existingUser.email,
            subject: "Verification Code",
            html: `<h1>${codeValue}</h1>`,
        });

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(
                codeValue,
                process.env.HMAC_CODE_VERIFICATION_SECRET
            );
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({
                success: true,
                message: "Verification code sent successfully",
            });
        }
        res.status(400).json({
            success: false,
            message: "Failed to send verification code",
        });
    } catch (error) {
        console.log(error);
    }
};

exports.verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;
    try {
        const { error, value } = acceptCodeSchema.validate({
            email,
            providedCode,
        });

        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const codeValue = providedCode.toString();

        const existingUser = await User.findOne({ email }).select(
            "+verificationCode +verificationCodeValidation"
        );

        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: "User does not exist" });
        }

        if (existingUser.verified) {
            return res
                .status(400)
                .json({ success: false, message: "User already verified" });
        }

        if (
            !existingUser.verificationCode ||
            !existingUser.verificationCodeValidation
        ) {
            return res.status(400).json({
                success: false,
                message: "Something went wrong with the code",
            });
        }

        if (
            Date.now() - existingUser.verificationCodeValidation >
            5 * 60 * 1000
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Code expired" });
        }

        const hashedCodeValue = hmacProcess(
            codeValue,
            process.env.HMAC_CODE_VERIFICATION_SECRET
        );

        if (hashedCodeValue !== existingUser.verificationCode) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid code" });
        }

        existingUser.verified = true;
        existingUser.verificationCode = undefined;
        existingUser.verificationCodeValidation = undefined;
        await existingUser.save();

        return res
            .status(200)
            .json({ success: true, message: "User verified successfully" });
    } catch (error) {
        console.log(error);
    }
};

exports.changePassword = async (req, res) => {
    const { userId, verified } = req.user;
    const { oldPassword, newPassword } = req.body;
    try {
        const { error, value } = changePasswordSchema.validate({
            oldPassword,
            newPassword,
        });

        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        if (!verified) {
            return res
                .status(401)
                .json({ success: false, message: "User are not verified yet" });
        }

        const existingUser = await User.findOne({ _id: userId }).select(
            "+password"
        );

        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: "User does not exist" });
        }

        const result = await doHashValidation(
            oldPassword,
            existingUser.password
        );

        if (!result) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        await existingUser.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.log(error);
    }
};

exports.sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: "User does not exist" });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.SMTP_EMAIL_USER,
            to: existingUser.email,
            subject: "Forgot Password Code",
            html: `<h1>${codeValue}</h1>`,
        });

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(
                codeValue,
                process.env.HMAC_CODE_VERIFICATION_SECRET
            );
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({
                success: true,
                message: "Forgot password code sent successfully",
            });
        }
        res.status(400).json({
            success: false,
            message: "Failed to send forgot password code",
        });
    } catch (error) {
        console.log(error);
    }
};

exports.verifyForgotPasswordCode = async (req, res) => {
    const { email, providedCode, newPassword } = req.body;
    try {
        const { error, value } = acceptForgotPasswordCodeSchema.validate({
            email,
            providedCode,
            newPassword,
        });

        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const codeValue = providedCode.toString();

        const existingUser = await User.findOne({ email }).select(
            "+forgotPasswordCode +forgotPasswordCodeValidation"
        );

        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: "User does not exist" });
        }

        if (
            !existingUser.forgotPasswordCode ||
            !existingUser.forgotPasswordCodeValidation
        ) {
            return res.status(400).json({
                success: false,
                message: "Something went wrong with the code",
            });
        }

        if (
            Date.now() - existingUser.forgotPasswordCodeValidation >
            5 * 60 * 1000
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Code expired" });
        }

        const hashedCodeValue = hmacProcess(
            codeValue,
            process.env.HMAC_CODE_VERIFICATION_SECRET
        );

        if (hashedCodeValue !== existingUser.forgotPasswordCode) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid code" });
        }

        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        existingUser.forgotPasswordCode = undefined;
        existingUser.forgotPasswordCodeValidation = undefined;
        await existingUser.save();

        return res
            .status(200)
            .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
    }
};
