import express from "express";

import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";

import {
    adminDashboard,
    getStudents,
    getStudentById,
    updateStudentStatus,
    deleteStudent
} from "../controllers/user.controller.js";


const router = express.Router();


/*
 * Existing admin endpoint
 */
router.get(
    "/admin",
    auth,
    admin,
    adminDashboard
);


/*
 * Student Management
 */
router.get(
    "/students",
    auth,
    admin,
    getStudents
);


router.get(
    "/students/:id",
    auth,
    admin,
    getStudentById
);


router.patch(
    "/students/:id/status",
    auth,
    admin,
    updateStudentStatus
);


router.delete(
    "/students/:id",
    auth,
    admin,
    deleteStudent
);


export default router;