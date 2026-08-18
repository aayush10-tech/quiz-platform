import crypto from "crypto";

import prisma from "../config/prisma.js";

import {
    hashPassword,
    comparePassword
} from "../utils/password.js";


/* =========================================================
   REGISTER
========================================================= */

export const registerUser = async (data) => {

    const existingUser =
        await prisma.user.findUnique({

            where: {
                email: data.email
            }

        });


    if (existingUser) {

        throw new Error(
            "Email already exists"
        );

    }


    const hashedPassword =
        await hashPassword(
            data.password
        );


    const user =
        await prisma.user.create({

            data: {

                name: data.name,

                email: data.email,

                password: hashedPassword

            }

        });


    return user;

};


/* =========================================================
   LOGIN
========================================================= */

export const loginUser = async (data) => {

    const user =
        await prisma.user.findUnique({

            where: {
                email: data.email
            }

        });


    if (!user) {

        throw new Error(
            "Invalid email or password"
        );

    }


    const isPasswordValid =
        await comparePassword(
            data.password,
            user.password
        );


    if (!isPasswordValid) {

        throw new Error(
            "Invalid email or password"
        );

    }


    if (user.status !== "ACTIVE") {

        throw new Error(
            "Your account has been deactivated"
        );

    }


    return user;

};


/* =========================================================
   CREATE PASSWORD RESET TOKEN
========================================================= */

export const createPasswordResetToken =
    async (email) => {

        const user =
            await prisma.user.findUnique({

                where: {
                    email
                }

            });


        // Do not reveal whether the email exists.

        if (!user) {

            return null;

        }


        // Generate a secure random token.

        const resetToken =
            crypto
                .randomBytes(32)
                .toString("hex");


        // Store only the hash in the database.

        const resetTokenHash =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        // Token expires after 15 minutes.

        const resetTokenExpiresAt =
            new Date(
                Date.now() +
                15 * 60 * 1000
            );


        await prisma.user.update({

            where: {
                id: user.id
            },

            data: {

                resetTokenHash,

                resetTokenExpiresAt

            }

        });


        return {

            resetToken,

            expiresAt:
                resetTokenExpiresAt

        };

    };


/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword =
    async (
        resetToken,
        newPassword
    ) => {

        if (!resetToken) {

            throw new Error(
                "Reset token is required"
            );

        }


        // Hash the token received from the frontend.

        const resetTokenHash =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        // Find a valid, non-expired token.

        const user =
            await prisma.user.findFirst({

                where: {

                    resetTokenHash,

                    resetTokenExpiresAt: {

                        gt: new Date()

                    }

                }

            });


        if (!user) {

            throw new Error(
                "Invalid or expired reset token"
            );

        }


        // Hash the new password using your existing utility.

        const hashedPassword =
            await hashPassword(
                newPassword
            );


        // Update password and invalidate the token.

        await prisma.user.update({

            where: {
                id: user.id
            },

            data: {

                password:
                    hashedPassword,

                resetTokenHash: null,

                resetTokenExpiresAt: null

            }

        });


        return true;

    };