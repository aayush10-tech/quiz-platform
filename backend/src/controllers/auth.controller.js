import {
    registerSchema,
    loginSchema,
} from "../validations/auth.validation.js";

import {
    registerUser,
    loginUser,
    createPasswordResetToken,
    resetPassword,
} from "../services/auth.service.js";

import { generateToken } from "../utils/jwt.js";


export const register = async (req, res) => {

    try {

        const data =
            registerSchema.parse(req.body);

        const user =
            await registerUser(data);

        const token =
            generateToken(user);

        return res.status(201).json({

            success: true,

            message: "Registration Successful",

            token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


export const login = async (req, res) => {

    try {

        const data =
            loginSchema.parse(req.body);

        const user =
            await loginUser(data);

        const token =
            generateToken(user);

        return res.json({

            success: true,

            message: "Login Successful",

            token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role,

            },

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message,

        });

    }

};


/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = async (req, res) => {

    try {

        const email =
            String(req.body.email || "")
                .trim()
                .toLowerCase();

        if (!email) {

            return res.status(400).json({

                success: false,

                message: "Email is required"

            });

        }


        const result =
            await createPasswordResetToken(email);


        /*
         * Always return the same normal message,
         * whether the email exists or not.
         */

        const response = {

            success: true,

            message:
                "If an account exists with this email, a password reset link has been generated."

        };


        /*
         * Development mode only.
         *
         * Since email sending is not configured yet,
         * return the reset URL so we can test locally.
         */

        if (
            process.env.NODE_ENV !== "production" &&
            result
        ) {

            const frontendUrl =
                process.env.FRONTEND_URL ||
                "http://localhost:5173";

            response.resetUrl =
                `${frontendUrl}/reset-password?token=${result.resetToken}`;

        }


        return res.json(response);

    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to process password reset request"

        });

    }

};


/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPasswordController =
    async (req, res) => {

        try {

            const {
                token,
                password
            } = req.body;


            if (!token) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Reset token is required"

                });

            }


            if (
                !password ||
                password.length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must be at least 6 characters"

                });

            }


            await resetPassword(
                token,
                password
            );


            return res.json({

                success: true,

                message:
                    "Password reset successfully. You can now login with your new password."

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

    };


/* =========================================================
   PROFILE
========================================================= */

export const getProfile = async (req, res) => {

    return res.json({

        success: true,

        user: req.user,

    });

};