import express from "express";

import {
    register,
    login,
    getProfile,
    forgotPassword,
    resetPasswordController
} from "../controllers/auth.controller.js";

import auth from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../validations/auth.validation.js";


const router = express.Router();


/* =========================================================
   REGISTER
========================================================= */

router.post(
    "/register",
    validate(registerSchema),
    register
);


/* =========================================================
   LOGIN
========================================================= */

router.post(
    "/login",
    validate(loginSchema),
    login
);


/* =========================================================
   FORGOT PASSWORD
========================================================= */

router.post(
    "/forgot-password",
    validate(forgotPasswordSchema),
    forgotPassword
);


/* =========================================================
   RESET PASSWORD
========================================================= */

router.post(
    "/reset-password",
    validate(resetPasswordSchema),
    resetPasswordController
);


/* =========================================================
   PROFILE
========================================================= */

router.get(
    "/profile",
    auth,
    getProfile
);


export default router;