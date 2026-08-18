import prisma from "../config/prisma.js";

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const getAdminDashboardService = async () => {

    // --------------------------------------------------------
    // Only STUDENT attempts should be included in admin stats
    // --------------------------------------------------------

    const studentAttemptFilter = {
        user: {
            role: "STUDENT"
        }
    };


    // --------------------------------------------------------
    // Basic overview
    // --------------------------------------------------------

    const [
        totalUsers,
        totalStudents,
        totalQuizzes,
        totalQuestions,
        totalAttempts,
        passedAttempts,
        failedAttempts
    ] = await Promise.all([

        prisma.user.count(),

        prisma.user.count({
            where: {
                role: "STUDENT"
            }
        }),

        prisma.quiz.count(),

        prisma.question.count(),

        prisma.attempt.count({
            where: studentAttemptFilter
        }),

        prisma.attempt.count({
            where: {
                ...studentAttemptFilter,
                status: "PASSED"
            }
        }),

        prisma.attempt.count({
            where: {
                ...studentAttemptFilter,
                status: "FAILED"
            }
        })

    ]);


    // --------------------------------------------------------
    // Pass rate
    // --------------------------------------------------------

    const passRate =
        totalAttempts === 0
            ? 0
            : Number(
                (
                    (passedAttempts / totalAttempts) * 100
                ).toFixed(2)
            );


    // --------------------------------------------------------
    // Recent student attempts
    // --------------------------------------------------------

    const recentAttempts =
        await prisma.attempt.findMany({

            where: studentAttemptFilter,

            take: 10,

            orderBy: {
                startedAt: "desc"
            },

            include: {

                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },

                quiz: {
                    select: {
                        id: true,
                        title: true
                    }
                }

            }

        });


    // --------------------------------------------------------
    // Top students
    // --------------------------------------------------------

    const topStudentsRaw =
        await prisma.user.findMany({

            where: {
                role: "STUDENT"
            },

            include: {

                attempts: {
                    where: {
                        status: {
                            in: [
                                "PASSED",
                                "FAILED"
                            ]
                        }
                    },

                    orderBy: {
                        startedAt: "desc"
                    }
                }

            }

        });


    const topStudents =
        topStudentsRaw.map(student => {

            const totalScore =
                student.attempts.reduce(
                    (sum, attempt) =>
                        sum +
                        Number(
                            attempt.percentage || 0
                        ),
                    0
                );


            const averageScore =
                student.attempts.length === 0
                    ? 0
                    : Number(
                        (
                            totalScore /
                            student.attempts.length
                        ).toFixed(2)
                    );


            return {

                id: student.id,

                name: student.name,

                email: student.email,

                attempts:
                    student.attempts.length,

                averageScore

            };

        });


    topStudents.sort(
        (a, b) =>
            b.averageScore -
            a.averageScore
    );


    // ========================================================
    // ANALYTICS
    // ========================================================


    // --------------------------------------------------------
    // 1. Attempts over time
    // --------------------------------------------------------
    //
    // Last 7 days
    // --------------------------------------------------------

    const attemptsForAnalytics =
        await prisma.attempt.findMany({

            where: {
                ...studentAttemptFilter,

                startedAt: {
                    gte: new Date(
                        Date.now() -
                        7 * 24 * 60 * 60 * 1000
                    )
                }
            },

            select: {
                startedAt: true
            },

            orderBy: {
                startedAt: "asc"
            }

        });


    const attemptsOverTime = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(
            date.getDate() - i
        );

        const dateKey =
            date.toISOString().split("T")[0];


        const count =
            attemptsForAnalytics.filter(
                attempt => {

                    const attemptDate =
                        new Date(
                            attempt.startedAt
                        )
                            .toISOString()
                            .split("T")[0];

                    return (
                        attemptDate ===
                        dateKey
                    );

                }
            ).length;


        attemptsOverTime.push({

            date: dateKey,

            label: date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short"
                }
            ),

            attempts: count

        });

    }


    // --------------------------------------------------------
    // 2. Student registrations over time
    // --------------------------------------------------------
    //
    // Last 7 days
    // --------------------------------------------------------

    const studentsForAnalytics =
        await prisma.user.findMany({

            where: {

                role: "STUDENT",

                createdAt: {
                    gte: new Date(
                        Date.now() -
                        7 * 24 * 60 * 60 * 1000
                    )
                }

            },

            select: {
                createdAt: true
            },

            orderBy: {
                createdAt: "asc"
            }

        });


    const registrationsOverTime = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(
            date.getDate() - i
        );

        const dateKey =
            date.toISOString().split("T")[0];


        const count =
            studentsForAnalytics.filter(
                student => {

                    const studentDate =
                        new Date(
                            student.createdAt
                        )
                            .toISOString()
                            .split("T")[0];

                    return (
                        studentDate ===
                        dateKey
                    );

                }
            ).length;


        registrationsOverTime.push({

            date: dateKey,

            label: date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short"
                }
            ),

            students: count

        });

    }


    // --------------------------------------------------------
    // 3. Pass / Fail
    // --------------------------------------------------------

    const passFail = {

        passed: passedAttempts,

        failed: failedAttempts

    };


    // --------------------------------------------------------
    // 4. Popular quizzes
    // --------------------------------------------------------

    const popularQuizRaw =
        await prisma.attempt.groupBy({

            by: ["quizId"],

            where: studentAttemptFilter,

            _count: {
                quizId: true
            },

            orderBy: {
                _count: {
                    quizId: "desc"
                }
            },

            take: 5

        });


    const popularQuizIds =
        popularQuizRaw.map(
            item => item.quizId
        );


    const popularQuizDetails =
        popularQuizIds.length > 0
            ? await prisma.quiz.findMany({

                where: {
                    id: {
                        in: popularQuizIds
                    }
                },

                select: {
                    id: true,
                    title: true
                }

            })
            : [];


    const popularQuizzes =
        popularQuizRaw.map(item => {

            const quiz =
                popularQuizDetails.find(
                    q =>
                        q.id ===
                        item.quizId
                );


            return {

                id: item.quizId,

                title:
                    quiz?.title ||
                    "Unknown Quiz",

                attempts:
                    item._count.quizId

            };

        });


    // --------------------------------------------------------
    // 5. Popular categories
    // --------------------------------------------------------

    const quizzesWithCategories =
        await prisma.quiz.findMany({

            select: {

                id: true,

                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }

            }

        });


    const quizCategoryMap =
        new Map();


    quizzesWithCategories.forEach(
        quiz => {

            if (quiz.category) {

                quizCategoryMap.set(
                    quiz.id,
                    quiz.category
                );

            }

        }
    );


    const categoryCounts =
        new Map();


    const allStudentAttempts =
        await prisma.attempt.findMany({

            where: studentAttemptFilter,

            select: {
                quizId: true
            }

        });


    allStudentAttempts.forEach(
        attempt => {

            const category =
                quizCategoryMap.get(
                    attempt.quizId
                );


            if (!category) {
                return;
            }


            const current =
                categoryCounts.get(
                    category.id
                ) || {

                    id: category.id,

                    name: category.name,

                    attempts: 0

                };


            current.attempts += 1;


            categoryCounts.set(
                category.id,
                current
            );

        }
    );


    const popularCategories =
        Array.from(
            categoryCounts.values()
        )
            .sort(
                (a, b) =>
                    b.attempts -
                    a.attempts
            )
            .slice(0, 5);


    // ========================================================
    // RETURN
    // ========================================================

    return {

        overview: {

            totalUsers,

            totalStudents,

            totalQuizzes,

            totalQuestions,

            totalAttempts,

            passedAttempts,

            failedAttempts,

            passRate

        },

        recentAttempts,

        topStudents:
            topStudents.slice(0, 10),

        analytics: {

            attemptsOverTime,

            registrationsOverTime,

            passFail,

            popularQuizzes,

            popularCategories

        }

    };

};


// ============================================================
// STUDENT DASHBOARD
// ============================================================

export const getStudentDashboardService =
    async (userId) => {

        const attempts =
            await prisma.attempt.findMany({

                where: {
                    userId
                },

                include: {

                    quiz: {

                        select: {

                            id: true,

                            title: true,

                            difficulty: true,

                            duration: true

                        }

                    }

                },

                orderBy: {

                    startedAt: "desc"

                }

            });


        // ----------------------------------------------------
        // Student statistics
        // ----------------------------------------------------

        const totalAttempts =
            attempts.length;


        const passed =
            attempts.filter(
                attempt =>
                    attempt.status ===
                    "PASSED"
            ).length;


        const failed =
            attempts.filter(
                attempt =>
                    attempt.status ===
                    "FAILED"
            ).length;


        const totalPercentage =
            attempts.reduce(
                (sum, attempt) =>
                    sum +
                    Number(
                        attempt.percentage || 0
                    ),
                0
            );


        const averageScore =
            totalAttempts === 0
                ? 0
                : Number(
                    (
                        totalPercentage /
                        totalAttempts
                    ).toFixed(2)
                );


        // ----------------------------------------------------
        // Return student dashboard data
        // ----------------------------------------------------

        return {

            overview: {

                totalAttempts,

                passed,

                failed,

                averageScore

            },

            recentAttempts:
                attempts.slice(0, 10)

        };

    };