import express from "express";

import auth from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { submitQuizSchema } from "../validations/attempt.validation.js";

import {
    startAttempt,
    submitAttempt,
    getAttemptResult,
    getMyAttempts
} from "../controllers/attempt.controller.js";

const router = express.Router();

router.post(
    "/start/:quizId",
    auth,
    startAttempt
);

router.post(
    "/submit",
    auth,
    validate(submitQuizSchema),
    submitAttempt
);

router.get(
    "/result/:attemptId",
    auth,
    getAttemptResult
);

router.get(
    "/my-attempts",
    auth,
    getMyAttempts
);

export default router;