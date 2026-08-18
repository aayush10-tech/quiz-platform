import express from "express";

import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";

import {
    getAdminReports
} from "../controllers/reports.controller.js";


const router = express.Router();


router.get(
    "/admin",
    auth,
    admin,
    getAdminReports
);


export default router;