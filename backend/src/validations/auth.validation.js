import { z } from "zod";


export const registerSchema = z.object({

    name: z
        .string()
        .trim()
        .min(
            3,
            "Name must be at least 3 characters"
        ),

    email: z
        .string()
        .trim()
        .email(
            "Invalid email"
        ),

    password: z
        .string()
        .min(
            6,
            "Password must be at least 6 characters"
        )

});


export const loginSchema = z.object({

    email: z
        .string()
        .trim()
        .email(
            "Invalid email"
        ),

    password: z
        .string()
        .min(
            6,
            "Password must be at least 6 characters"
        )

});


/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPasswordSchema =
    z.object({

        email: z
            .string()
            .trim()
            .email(
                "Invalid email"
            )

    });


/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPasswordSchema =
    z.object({

        token: z
            .string()
            .trim()
            .min(
                1,
                "Reset token is required"
            ),

        password: z
            .string()
            .min(
                6,
                "Password must be at least 6 characters"
            )

    });