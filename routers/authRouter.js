const express = require("express");
const {
    signin,
    signup,
    logout,
    sendVerificationCode,
    verifyVerificationCode,
    changePassword,
    sendForgotPasswordCode,
    verifyForgotPasswordCode,
} = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", identifier, logout);

router.patch("/send-verification-code", identifier, sendVerificationCode);
router.post("/verify-verification-code", identifier, verifyVerificationCode);

router.patch("/change-password", identifier, changePassword);

router.patch("/send-forgot-password-code", sendForgotPasswordCode);
router.post("/verify-forgot-password-code", verifyForgotPasswordCode);

module.exports = router;
