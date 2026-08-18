import express from "express";

import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";

import {
    getAdminDashboard,
    getStudentDashboard
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
    "/admin",
    auth,
    admin,
    getAdminDashboard
);

router.get(
    "/student",
    auth,
    getStudentDashboard
);

export default router;