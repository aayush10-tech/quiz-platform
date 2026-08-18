import prisma from "../config/prisma.js";
import slugify from "slugify";
import ApiError from "../utils/ApiError.js";


/* =========================================================
   CREATE QUIZ
========================================================= */

export const createQuizService = async (
    data,
    adminId
) => {

    const category =
        await prisma.category.findUnique({

            where: {
                id: data.categoryId
            }

        });


    if (!category) {

        throw new ApiError(
            404,
            "Category not found"
        );

    }


    const slug =
        slugify(
            data.title,
            {
                lower: true,
                strict: true
            }
        );


    const exists =
        await prisma.quiz.findUnique({

            where: {
                slug
            }

        });


    if (exists) {

        throw new ApiError(
            400,
            "Quiz already exists"
        );

    }


    const quiz =
        await prisma.quiz.create({

            data: {

                title:
                    data.title,

                slug,

                description:
                    data.description,

                instructions:
                    data.instructions,

                duration:
                    data.duration,

                passingScore:
                    data.passingScore,

                maxAttempts:
                    data.maxAttempts,

                negativeMarks:
                    data.negativeMarks ?? 0.5,

                difficulty:
                    data.difficulty,

                thumbnail:
                    data.thumbnail,

                isFeatured:
                    data.isFeatured ?? false,

                categoryId:
                    data.categoryId,

                createdBy:
                    adminId

            },

            include: {

                category: true,

                creator: {

                    select: {

                        id: true,

                        name: true,

                        email: true

                    }

                },

                _count: {

                    select: {

                        questions: true,

                        attempts: true

                    }

                }

            }

        });


    return quiz;

};


/* =========================================================
   GET QUIZZES
========================================================= */

export const getQuizzesService = async (

    page,
    limit,
    search,
    category,
    difficulty,
    status,
    isAdmin = false

) => {

    const skip =
        (page - 1) * limit;


    const where = {

        ...(search && {

            title: {

                contains: search,

                mode: "insensitive"

            }

        }),


        ...(category && {

            categoryId:
                Number(category)

        }),


        ...(difficulty && {

            difficulty

        })

    };


    if (isAdmin) {

        if (status) {

            where.status =
                status;

        }

    } else {

        where.status =
            "PUBLISHED";

    }


    const total =
        await prisma.quiz.count({

            where

        });


    const quizzes =
        await prisma.quiz.findMany({

            where,

            skip,

            take: limit,

            orderBy: {

                createdAt:
                    "desc"

            },

            include: {

                category: true,

                creator: {

                    select: {

                        id: true,

                        name: true

                    }

                },

                _count: {

                    select: {

                        questions: true,

                        attempts: true

                    }

                }

            }

        });


    return {

        total,

        page,

        limit,

        quizzes

    };

};


/* =========================================================
   GET QUIZ BY ID
========================================================= */

export const getQuizByIdService = async (

    id,
    isAdmin = false

) => {

    const quiz =
        await prisma.quiz.findUnique({

            where: {

                id

            },

            include: {

                category: true,

                creator: {

                    select: {

                        id: true,

                        name: true

                    }

                },

                _count: {

                    select: {

                        questions: true,

                        attempts: true

                    }

                }

            }

        });


    if (!quiz) {

        throw new ApiError(
            404,
            "Quiz not found"
        );

    }


    if (
        !isAdmin &&
        quiz.status !== "PUBLISHED"
    ) {

        throw new ApiError(
            404,
            "Quiz not found"
        );

    }


    return quiz;

};


/* =========================================================
   UPDATE QUIZ
========================================================= */

export const updateQuizService =
    async (
        id,
        data
    ) => {

        const quiz =
            await prisma.quiz.findUnique({

                where: {
                    id
                }

            });


        if (!quiz) {

            throw new ApiError(
                404,
                "Quiz not found"
            );

        }


        const category =
            await prisma.category.findUnique({

                where: {

                    id:
                        data.categoryId

                }

            });


        if (!category) {

            throw new ApiError(
                404,
                "Category not found"
            );

        }


        const slug =
            slugify(

                data.title,

                {

                    lower: true,

                    strict: true

                }

            );


        return await prisma.quiz.update({

            where: {

                id

            },

            data: {

                title:
                    data.title,

                slug,

                description:
                    data.description,

                instructions:
                    data.instructions,

                duration:
                    data.duration,

                passingScore:
                    data.passingScore,

                maxAttempts:
                    data.maxAttempts,

                negativeMarks:
                    data.negativeMarks ?? 0.5,

                difficulty:
                    data.difficulty,

                thumbnail:
                    data.thumbnail,

                isFeatured:
                    data.isFeatured ?? false,

                categoryId:
                    data.categoryId

            },

            include: {

                category: true,

                creator: true,

                _count: {

                    select: {

                        questions: true,

                        attempts: true

                    }

                }

            }

        });

    };


/* =========================================================
   DELETE QUIZ
========================================================= */

export const deleteQuizService =
    async (id) => {

        const quiz =
            await prisma.quiz.findUnique({

                where: {
                    id
                }

            });


        if (!quiz) {

            throw new ApiError(
                404,
                "Quiz not found"
            );

        }


        await prisma.quiz.delete({

            where: {
                id
            }

        });

    };


/* =========================================================
   PUBLISH QUIZ
========================================================= */

export const publishQuizService =
    async (id) => {

        const quiz =
            await prisma.quiz.findUnique({

                where: {
                    id
                }

            });


        if (!quiz) {

            throw new ApiError(
                404,
                "Quiz not found"
            );

        }


        return await prisma.quiz.update({

            where: {

                id

            },

            data: {

                status:
                    "PUBLISHED"

            }

        });

    };


/* =========================================================
   UNPUBLISH QUIZ
========================================================= */

export const unpublishQuizService =
    async (id) => {

        const quiz =
            await prisma.quiz.findUnique({

                where: {

                    id

                }

            });


        if (!quiz) {

            throw new ApiError(
                404,
                "Quiz not found"
            );

        }


        return await prisma.quiz.update({

            where: {

                id

            },

            data: {

                status:
                    "DRAFT"

            }

        });

    };