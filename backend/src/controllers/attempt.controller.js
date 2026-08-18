import asyncHandler from "../middleware/async.middleware.js";
import ApiResponse from "../utils/ApiResponse.js";

import { formatAttemptDates } from "../utils/date.js";

import {
    startAttemptService,
    submitAttemptService,
    getAttemptResultService,
    getMyAttemptsService
} from "../services/attempt.service.js";


export const startAttempt = asyncHandler(async (req, res) => {

    const attempt = await startAttemptService(
        Number(req.params.quizId),
        req.user.id
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            formatAttemptDates(attempt),
            "Quiz started successfully"
        )
    );

});


export const submitAttempt = asyncHandler(async (req, res) => {

    const attempt = await submitAttemptService(
        req.validatedData.attemptId,
        req.validatedData.answers,
        req.user.id
    );

    return res.json(
        new ApiResponse(
            200,
            formatAttemptDates(attempt),
            "Quiz submitted successfully"
        )
    );

});


export const getAttemptResult = asyncHandler(async (req, res) => {

    const result = await getAttemptResultService(
        Number(req.params.attemptId),
        req.user.id
    );

    return res.json(
        new ApiResponse(
            200,
            formatAttemptDates(result),
            "Result fetched successfully"
        )
    );

});


export const getMyAttempts = asyncHandler(async (req, res) => {

    const attempts = await getMyAttemptsService(
        req.user.id
    );

    const formattedAttempts =
        attempts.map(formatAttemptDates);

    return res.json(
        new ApiResponse(
            200,
            formattedAttempts,
            "Attempts fetched successfully"
        )
    );

});