const Joi = require("joi");

exports.signupSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(60)
        .required()
        .email({ tlds: { allow: ["com", "net"] } })
        .messages({
            "string.email": "Email must be a valid .com or .net address",
            "string.min": "Email must be at least 5 characters long",
            "string.max": "Email must not exceed 60 characters",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .required()
        .pattern(
            new RegExp(
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
            )
        )
        .messages({
            "string.pattern.base":
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
            "any.required": "Password is required",
        }),
});

exports.signinSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(60)
        .required()
        .email({ tlds: { allow: ["com", "net"] } })
        .messages({
            "string.email": "Email must be a valid .com or .net address",
            "string.min": "Email must be at least 5 characters long",
            "string.max": "Email must not exceed 60 characters",
            "any.required": "Email is required",
        }),

    password: Joi.string().required().messages({
        "any.required": "Password is required",
    }),
});

exports.acceptCodeSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(60)
        .required()
        .email({ tlds: { allow: ["com", "net"] } })
        .messages({
            "string.email": "Email must be a valid .com or .net address",
            "string.min": "Email must be at least 5 characters long",
            "string.max": "Email must not exceed 60 characters",
            "any.required": "Email is required",
        }),
    providedCode: Joi.number().required(),
});

exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        "any.required": "Old password is required",
    }),
    newPassword: Joi.string()
        .required()
        .pattern(
            new RegExp(
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
            )
        )
        .messages({
            "string.pattern.base":
                "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
            "any.required": "New password is required",
        }),
});

exports.acceptForgotPasswordCodeSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(60)
        .required()
        .email({ tlds: { allow: ["com", "net"] } })
        .messages({
            "string.email": "Email must be a valid .com or .net address",
            "string.min": "Email must be at least 5 characters long",
            "string.max": "Email must not exceed 60 characters",
            "any.required": "Email is required",
        }),
    providedCode: Joi.number().required(),
    newPassword: Joi.string()
        .required()
        .pattern(
            new RegExp(
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
            )
        )
        .messages({
            "string.pattern.base":
                "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
            "any.required": "New password is required",
        }),
});
