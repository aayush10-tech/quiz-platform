import asyncHandler from "../middleware/async.middleware.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    createQuizService,
    getQuizzesService,
    getQuizByIdService,
    updateQuizService,
    deleteQuizService,
    publishQuizService,
    unpublishQuizService
} from "../services/quiz.service.js";


/* =========================================================
   CREATE QUIZ
========================================================= */

export const createQuiz =
    asyncHandler(async (req, res) => {

        const quiz =
            await createQuizService(

                req.validatedData,

                req.user.id

            );


        return res.status(201).json(

            new ApiResponse(

                201,

                quiz,

                "Quiz created successfully"

            )

        );

    });


/* =========================================================
   GET QUIZZES
========================================================= */

export const getQuizzes =
    asyncHandler(async (req, res) => {

        const page =
            Number(
                req.query.page
            ) || 1;


        const limit =
            Number(
                req.query.limit
            ) || 10;


        const isAdmin =
            req.user.role === "ADMIN";


        const result =
            await getQuizzesService(

                page,

                limit,

                req.query.search,

                req.query.category,

                req.query.difficulty,

                req.query.status,

                isAdmin

            );


        return res.json(

            new ApiResponse(

                200,

                result

            )

        );

    });


/* =========================================================
   GET QUIZ BY ID
========================================================= */

export const getQuizById =
    asyncHandler(async (req, res) => {

        const isAdmin =
            req.user.role === "ADMIN";


        const quiz =
            await getQuizByIdService(

                Number(
                    req.params.id
                ),

                isAdmin

            );


        return res.json(

            new ApiResponse(

                200,

                quiz

            )

        );

    });


/* =========================================================
   UPDATE QUIZ
========================================================= */

export const updateQuiz =
    asyncHandler(async (req, res) => {

        const quiz =
            await updateQuizService(

                Number(
                    req.params.id
                ),

                req.validatedData

            );


        return res.json(

            new ApiResponse(

                200,

                quiz,

                "Quiz updated successfully"

            )

        );

    });


/* =========================================================
   DELETE QUIZ
========================================================= */

export const deleteQuiz =
    asyncHandler(async (req, res) => {

        await deleteQuizService(

            Number(
                req.params.id
            )

        );


        return res.json(

            new ApiResponse(

                200,

                null,

                "Quiz deleted successfully"

            )

        );

    });


/* =========================================================
   PUBLISH QUIZ
========================================================= */

export const publishQuiz =
    asyncHandler(async (req, res) => {

        const quiz =
            await publishQuizService(

                Number(
                    req.params.id
                )

            );


        return res.json(

            new ApiResponse(

                200,

                quiz,

                "Quiz published"

            )

        );

    });


/* =========================================================
   UNPUBLISH QUIZ
========================================================= */

export const unpublishQuiz =
    asyncHandler(async (req, res) => {

        const quiz =
            await unpublishQuizService(

                Number(
                    req.params.id
                )

            );


        return res.json(

            new ApiResponse(

                200,

                quiz,

                "Quiz unpublished"

            )

        );

    });