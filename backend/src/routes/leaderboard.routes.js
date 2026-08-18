import express from "express";

import auth from "../middleware/auth.middleware.js";

import {
    getLeaderboard
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// Get student leaderboard
router.get(
    "/",
    auth,
    getLeaderboard
);

export default router;