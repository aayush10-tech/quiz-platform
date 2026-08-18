import asyncHandler from "../middleware/async.middleware.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    createQuestionService,
    getQuestionsByQuizService,
    getQuestionByIdService,
    deleteQuestionService
} from "../services/question.service.js";


/* =========================================================
   CREATE QUESTION
========================================================= */

export const createQuestion =
    asyncHandler(async (req, res) => {

        const question =
            await createQuestionService(
                req.validatedData
            );


        return res.status(201).json(

            new ApiResponse(

                201,

                question,

                "Question created successfully"

            )

        );

    });


/* =========================================================
   GET QUESTIONS BY QUIZ
========================================================= */

export const getQuestionsByQuiz =
    asyncHandler(async (req, res) => {

        const isAdmin =
            req.user.role === "ADMIN";


        const questions =
            await getQuestionsByQuizService(

                Number(
                    req.params.quizId
                ),

                isAdmin

            );


        return res.json(

            new ApiResponse(

                200,

                questions

            )

        );

    });


/* =========================================================
   GET QUESTION BY ID
========================================================= */

export const getQuestionById =
    asyncHandler(async (req, res) => {

        const isAdmin =
            req.user.role === "ADMIN";


        const question =
            await getQuestionByIdService(

                Number(
                    req.params.id
                ),

                isAdmin

            );


        return res.json(

            new ApiResponse(

                200,

                question

            )

        );

    });


/* =========================================================
   DELETE QUESTION
========================================================= */

export const deleteQuestion =
    asyncHandler(async (req, res) => {

        await deleteQuestionService(

            Number(
                req.params.id
            )

        );


        return res.json(

            new ApiResponse(

                200,

                null,

                "Question deleted successfully"

            )

        );

    });