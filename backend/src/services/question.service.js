import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";


/* =========================================================
   CREATE QUESTION
   ADMIN ONLY
========================================================= */

export const createQuestionService = async (data) => {

    const quiz = await prisma.quiz.findUnique({

        where: {
            id: data.quizId
        }

    });


    if (!quiz) {

        throw new ApiError(
            404,
            "Quiz not found"
        );

    }


    const question =
        await prisma.question.create({

            data: {

                questionText:
                    data.questionText,

                explanation:
                    data.explanation,

                marks:
                    data.marks,

                questionOrder:
                    data.questionOrder,

                quizId:
                    data.quizId,

                options: {

                    create:
                        data.options.map(
                            option => ({

                                optionText:
                                    option.optionText,

                                isCorrect:
                                    option.isCorrect

                            })
                        )

                }

            },

            include: {

                options: true,

                quiz: {

                    select: {

                        id: true,

                        title: true

                    }

                }

            }

        });


    return question;

};


/* =========================================================
   GET QUESTIONS BY QUIZ
========================================================= */

export const getQuestionsByQuizService =
    async (
        quizId,
        isAdmin = false
    ) => {

        /*
         * Verify quiz exists.
         */

        const quiz =
            await prisma.quiz.findUnique({

                where: {
                    id: quizId
                }

            });


        if (!quiz) {

            throw new ApiError(
                404,
                "Quiz not found"
            );

        }


        /*
         * Students can only access
         * published quizzes.
         */

        if (
            !isAdmin &&
            quiz.status !== "PUBLISHED"
        ) {

            throw new ApiError(
                403,
                "This quiz is not available"
            );

        }


        /*
         * ADMIN:
         * Return isCorrect because the admin
         * needs it for question management.
         */

        if (isAdmin) {

            return await prisma.question.findMany({

                where: {

                    quizId

                },

                include: {

                    options: true

                },

                orderBy: {

                    questionOrder: "asc"

                }

            });

        }


        /*
         * STUDENT:
         * NEVER return isCorrect.
         */

        return await prisma.question.findMany({

            where: {

                quizId

            },

            select: {

                id: true,

                questionText: true,

                explanation: false,

                marks: true,

                questionOrder: true,

                quizId: true,

                options: {

                    select: {

                        id: true,

                        optionText: true

                    }

                }

            },

            orderBy: {

                questionOrder: "asc"

            }

        });

    };


/* =========================================================
   GET QUESTION BY ID
========================================================= */

export const getQuestionByIdService =
    async (
        id,
        isAdmin = false
    ) => {

        const question =
            await prisma.question.findUnique({

                where: {

                    id

                },

                include: {

                    quiz: {

                        select: {

                            id: true,

                            status: true

                        }

                    }

                }

            });


        if (!question) {

            throw new ApiError(
                404,
                "Question not found"
            );

        }


        /*
         * Students cannot access questions
         * from unpublished quizzes.
         */

        if (
            !isAdmin &&
            question.quiz.status !== "PUBLISHED"
        ) {

            throw new ApiError(
                403,
                "This question is not available"
            );

        }


        /*
         * ADMIN gets complete question data.
         */

        if (isAdmin) {

            return await prisma.question.findUnique({

                where: {

                    id

                },

                include: {

                    options: true

                }

            });

        }


        /*
         * STUDENT gets question + options,
         * but NEVER isCorrect.
         */

        return await prisma.question.findUnique({

            where: {

                id

            },

            select: {

                id: true,

                questionText: true,

                marks: true,

                questionOrder: true,

                quizId: true,

                options: {

                    select: {

                        id: true,

                        optionText: true

                    }

                }

            }

        });

    };


/* =========================================================
   DELETE QUESTION
   ADMIN ONLY
========================================================= */

export const deleteQuestionService =
    async (id) => {

        const question =
            await prisma.question.findUnique({

                where: {
                    id
                }

            });


        if (!question) {

            throw new ApiError(
                404,
                "Question not found"
            );

        }


        await prisma.question.delete({

            where: {
                id
            }

        });

    };