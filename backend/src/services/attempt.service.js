import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";


/* =========================================================
   START ATTEMPT
========================================================= */

export const startAttemptService = async (
    quizId,
    userId
) => {

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


    if (
        quiz.status !==
        "PUBLISHED"
    ) {

        throw new ApiError(
            400,
            "Quiz is not published"
        );

    }


    const questionCount =
        await prisma.question.count({

            where: {
                quizId
            }

        });


    if (
        questionCount === 0
    ) {

        throw new ApiError(
            400,
            "This quiz does not have any questions"
        );

    }


    const completedAttempts =
        await prisma.attempt.count({

            where: {

                quizId,

                userId,

                status: {
                    in: [
                        "PASSED",
                        "FAILED"
                    ]
                }

            }

        });


    if (
        completedAttempts >=
        quiz.maxAttempts
    ) {

        throw new ApiError(
            400,
            "Maximum attempts reached"
        );

    }


    const existingAttempt =
        await prisma.attempt.findFirst({

            where: {

                quizId,

                userId,

                status:
                    "IN_PROGRESS"

            },

            orderBy: {

                startedAt:
                    "desc"

            }

        });


    if (existingAttempt) {

        return existingAttempt;

    }


    return await prisma.attempt.create({

        data: {

            quizId,

            userId

        }

    });

};


/* =========================================================
   SUBMIT ATTEMPT
========================================================= */

export const submitAttemptService = async (
    attemptId,
    answers,
    userId
) => {

    return await prisma.$transaction(
        async (tx) => {

            const attempt =
                await tx.attempt.findFirst({

                    where: {

                        id:
                            attemptId,

                        userId

                    },

                    include: {

                        quiz: true

                    }

                });


            if (!attempt) {

                throw new ApiError(
                    404,
                    "Attempt not found"
                );

            }


            if (
                attempt.status !==
                "IN_PROGRESS"
            ) {

                throw new ApiError(
                    400,
                    "Quiz already submitted"
                );

            }


            const questions =
                await tx.question.findMany({

                    where: {

                        quizId:
                            attempt.quizId

                    },

                    include: {

                        options: true

                    },

                    orderBy: {

                        questionOrder:
                            "asc"

                    }

                });


            const questionMap =
                new Map(

                    questions.map(
                        question => [

                            question.id,

                            question

                        ]
                    )

                );


            const submittedQuestionIds =
                new Set();


            let correctAnswers = 0;

            let incorrectAnswers = 0;

            let correctMarks = 0;

            let negativeMarksDeducted = 0;


            /*
             * Negative marking configured
             * for this quiz.
             */

            const negativeMarkValue =
                Number(
                    attempt.quiz.negativeMarks ??
                    0
                );


            /*
             * Process submitted answers.
             */

            for (
                const answer
                of answers
            ) {

                if (
                    submittedQuestionIds.has(
                        answer.questionId
                    )
                ) {

                    continue;

                }


                submittedQuestionIds.add(
                    answer.questionId
                );


                const question =
                    questionMap.get(
                        answer.questionId
                    );


                if (!question) {

                    throw new ApiError(
                        400,
                        "Invalid question submitted"
                    );

                }


                const option =
                    question.options.find(
                        item =>
                            item.id ===
                            answer.optionId
                    );


                if (!option) {

                    throw new ApiError(
                        400,
                        "Invalid option submitted"
                    );

                }


                /*
                 * Correctness comes from
                 * the database.
                 */

                await tx.answer.create({

                    data: {

                        attemptId,

                        questionId:
                            answer.questionId,

                        selectedOptionId:
                            answer.optionId,

                        isCorrect:
                            option.isCorrect

                    }

                });


                if (
                    option.isCorrect
                ) {

                    correctAnswers++;


                    /*
                     * Use the question's
                     * configured marks.
                     */

                    correctMarks +=
                        Number(
                            question.marks ?? 0
                        );

                } else {

                    incorrectAnswers++;


                    /*
                     * Wrong answer penalty.
                     */

                    negativeMarksDeducted +=
                        negativeMarkValue;

                }

            }


            const totalQuestions =
                questions.length;


            const answeredQuestions =
                correctAnswers +
                incorrectAnswers;


            const unanswered =
                Math.max(

                    0,

                    totalQuestions -
                    answeredQuestions

                );


            /*
             * Total marks available
             * in the quiz.
             */

            const totalMarks =
                questions.reduce(

                    (
                        total,
                        question
                    ) => {

                        return (
                            total +
                            Number(
                                question.marks ??
                                0
                            )
                        );

                    },

                    0

                );


            /*
             * FINAL SCORE
             *
             * Correct marks
             * MINUS
             * wrong-answer penalties.
             */

            const rawScore =
                correctMarks -
                negativeMarksDeducted;


            /*
             * Keep the score from becoming
             * negative.
             *
             * Example:
             *
             * 0 correct
             * 4 wrong
             * -2 penalty
             *
             * Final score = 0
             */

            const score =
                Math.max(
                    0,
                    Number(
                        rawScore.toFixed(2)
                    )
                );


            /*
             * Percentage is calculated against
             * the total possible marks.
             */

            const percentage =
                totalMarks <= 0

                    ? 0

                    : Number(

                        (
                            score /
                            totalMarks
                        ) * 100

                    );


            const roundedPercentage =
                Number(
                    Math.max(
                        0,
                        percentage
                    ).toFixed(2)
                );


            const status =
                roundedPercentage >=
                attempt.quiz.passingScore

                    ? "PASSED"

                    : "FAILED";


            const completedAt =
                new Date();


            const timeTaken =
                Math.max(

                    0,

                    Math.floor(

                        (
                            completedAt -
                            attempt.startedAt
                        ) / 1000

                    )

                );


            const updatedAttempt =
                await tx.attempt.update({

                    where: {

                        id:
                            attemptId

                    },

                    data: {

                        score,

                        percentage:
                            roundedPercentage,

                        correctAnswers,

                        incorrectAnswers,

                        unanswered,

                        timeTaken,

                        completedAt,

                        status

                    }

                });


            return updatedAttempt;

        }

    );

};


/* =========================================================
   GET ATTEMPT RESULT
========================================================= */

export const getAttemptResultService =
    async (
        attemptId,
        userId
    ) => {

        const attempt =
            await prisma.attempt.findFirst({

                where: {

                    id:
                        attemptId,

                    userId

                },

                include: {

                    quiz: {

                        select: {

                            id: true,

                            title: true,

                            description: true,

                            passingScore: true,

                            duration: true,

                            difficulty: true,

                            negativeMarks: true

                        }

                    },

                    answers: {

                        include: {

                            question: true,

                            selectedOption: true

                        }

                    }

                }

            });


        if (!attempt) {

            throw new ApiError(
                404,
                "Result not found"
            );

        }


        return attempt;

    };


/* =========================================================
   GET MY ATTEMPTS
========================================================= */

export const getMyAttemptsService =
    async (userId) => {

        return await prisma.attempt.findMany({

            where: {

                userId

            },

            include: {

                quiz: {

                    select: {

                        id: true,

                        title: true,

                        difficulty: true,

                        duration: true,

                        passingScore: true,

                        negativeMarks: true

                    }

                }

            },

            orderBy: {

                startedAt:
                    "desc"

            }

        });

    };