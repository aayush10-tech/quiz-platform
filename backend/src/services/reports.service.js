import prisma from "../config/prisma.js";


// ============================================================
// ADMIN REPORTS + ANALYTICS
// ============================================================

export const getAdminReportsService = async () => {

    // ========================================================
    // LOAD QUIZZES
    // ========================================================

    const quizzes = await prisma.quiz.findMany({

        orderBy: {
            createdAt: "desc"
        },

        include: {

            category: {
                select: {
                    id: true,
                    name: true
                }
            },

            questions: {
                select: {
                    id: true
                }
            },

            attempts: {

                include: {

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    }

                },

                orderBy: {
                    startedAt: "desc"
                }

            }

        }

    });


    // ========================================================
    // STUDENTS
    // ========================================================

    const students = await prisma.user.findMany({

        where: {
            role: "STUDENT"
        },

        select: {

            id: true,
            name: true,
            email: true,
            status: true,

            createdAt: true,

            attempts: {

                include: {

                    quiz: {
                        select: {
                            id: true,
                            title: true
                        }
                    }

                },

                orderBy: {
                    startedAt: "desc"
                }

            }

        },

        orderBy: {
            name: "asc"
        }

    });


    // ========================================================
    // STUDENT ATTEMPTS
    // ========================================================

    const studentAttempts = [];

    quizzes.forEach((quiz) => {

        quiz.attempts.forEach((attempt) => {

            if (attempt.user?.role === "STUDENT") {

                studentAttempts.push({

                    ...attempt,

                    quiz: {
                        id: quiz.id,
                        title: quiz.title
                    }

                });

            }

        });

    });


    // ========================================================
    // OVERALL STATISTICS
    // ========================================================

    const totalAttempts =
        studentAttempts.length;


    const passedAttempts =
        studentAttempts.filter(
            (attempt) =>
                attempt.status === "PASSED"
        ).length;


    const failedAttempts =
        studentAttempts.filter(
            (attempt) =>
                attempt.status === "FAILED"
        ).length;


    const inProgressAttempts =
        studentAttempts.filter(
            (attempt) =>
                attempt.status === "IN_PROGRESS"
        ).length;


    const completedAttempts =
        studentAttempts.filter(
            (attempt) =>
                attempt.status === "PASSED" ||
                attempt.status === "FAILED"
        );


    const totalScore =
        completedAttempts.reduce(
            (sum, attempt) =>
                sum +
                Number(
                    attempt.percentage || 0
                ),
            0
        );


    const averageScore =
        completedAttempts.length === 0
            ? 0
            : Number(
                (
                    totalScore /
                    completedAttempts.length
                ).toFixed(2)
            );


    const passRate =
        completedAttempts.length === 0
            ? 0
            : Number(
                (
                    (passedAttempts /
                        completedAttempts.length) *
                    100
                ).toFixed(2)
            );


    // ========================================================
    // QUIZ REPORTS
    // ========================================================

    const quizReports =
        quizzes.map((quiz) => {

            const attempts =
                quiz.attempts.filter(
                    (attempt) =>
                        attempt.user?.role ===
                        "STUDENT"
                );


            const completed =
                attempts.filter(
                    (attempt) =>
                        attempt.status ===
                            "PASSED" ||
                        attempt.status ===
                            "FAILED"
                );


            const passed =
                attempts.filter(
                    (attempt) =>
                        attempt.status ===
                        "PASSED"
                ).length;


            const failed =
                attempts.filter(
                    (attempt) =>
                        attempt.status ===
                        "FAILED"
                ).length;


            const scoreTotal =
                completed.reduce(
                    (sum, attempt) =>
                        sum +
                        Number(
                            attempt.percentage ||
                                0
                        ),
                    0
                );


            const quizAverage =
                completed.length === 0
                    ? 0
                    : Number(
                        (
                            scoreTotal /
                            completed.length
                        ).toFixed(2)
                    );


            const quizPassRate =
                completed.length === 0
                    ? 0
                    : Number(
                        (
                            (passed /
                                completed.length) *
                            100
                        ).toFixed(2)
                    );


            return {

                id: quiz.id,

                title: quiz.title,

                category:
                    quiz.category?.name ||
                    "Uncategorized",

                difficulty:
                    quiz.difficulty,

                status:
                    quiz.status,

                questions:
                    quiz.questions.length,

                attempts:
                    attempts.length,

                passed,

                failed,

                averageScore:
                    quizAverage,

                passRate:
                    quizPassRate

            };

        });


    // ========================================================
    // STUDENT REPORTS
    // ========================================================

    const studentReports =
        students.map((student) => {

            const attempts =
                student.attempts;


            const completed =
                attempts.filter(
                    (attempt) =>
                        attempt.status ===
                            "PASSED" ||
                        attempt.status ===
                            "FAILED"
                );


            const passed =
                attempts.filter(
                    (attempt) =>
                        attempt.status ===
                        "PASSED"
                ).length;


            const failed =
                attempts.filter(
                    (attempt) =>
                        attempt.status ===
                        "FAILED"
                ).length;


            const scoreTotal =
                completed.reduce(
                    (sum, attempt) =>
                        sum +
                        Number(
                            attempt.percentage ||
                                0
                        ),
                    0
                );


            const studentAverage =
                completed.length === 0
                    ? 0
                    : Number(
                        (
                            scoreTotal /
                            completed.length
                        ).toFixed(2)
                    );


            return {

                id:
                    student.id,

                name:
                    student.name,

                email:
                    student.email,

                status:
                    student.status,

                attempts:
                    attempts.length,

                passed,

                failed,

                averageScore:
                    studentAverage

            };

        });


    studentReports.sort(
        (a, b) =>
            b.averageScore -
            a.averageScore
    );


    // ========================================================
    // RECENT ATTEMPTS
    // ========================================================

    studentAttempts.sort(
        (a, b) =>
            new Date(b.startedAt) -
            new Date(a.startedAt)
    );


    const recentAttempts =
        studentAttempts
            .slice(0, 20)
            .map((attempt) => ({

                id:
                    attempt.id,

                student: {

                    id:
                        attempt.user.id,

                    name:
                        attempt.user.name,

                    email:
                        attempt.user.email

                },

                quiz:
                    attempt.quiz,

                score:
                    Number(
                        attempt.score || 0
                    ),

                percentage:
                    Number(
                        attempt.percentage || 0
                    ),

                correctAnswers:
                    attempt.correctAnswers,

                incorrectAnswers:
                    attempt.incorrectAnswers,

                unanswered:
                    attempt.unanswered,

                status:
                    attempt.status,

                timeTaken:
                    attempt.timeTaken,

                startedAt:
                    attempt.startedAt,

                completedAt:
                    attempt.completedAt

            }));


    // ========================================================
    // ANALYTICS — ATTEMPTS OVER TIME
    // ========================================================

    const attemptsByDate = {};


    studentAttempts.forEach(
        (attempt) => {

            const date =
                new Date(
                    attempt.startedAt
                )
                    .toISOString()
                    .split("T")[0];


            if (!attemptsByDate[date]) {

                attemptsByDate[date] = {

                    date,

                    attempts: 0,

                    passed: 0,

                    failed: 0

                };

            }


            attemptsByDate[date].attempts += 1;


            if (
                attempt.status ===
                "PASSED"
            ) {

                attemptsByDate[date].passed +=
                    1;

            }


            if (
                attempt.status ===
                "FAILED"
            ) {

                attemptsByDate[date].failed +=
                    1;

            }

        }
    );


    const attemptsOverTime =
        Object.values(
            attemptsByDate
        ).sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    // ========================================================
    // ANALYTICS — REGISTRATIONS OVER TIME
    // ========================================================

    const registrationsByDate = {};


    students.forEach(
        (student) => {

            const date =
                new Date(
                    student.createdAt
                )
                    .toISOString()
                    .split("T")[0];


            if (
                !registrationsByDate[date]
            ) {

                registrationsByDate[date] = {

                    date,

                    registrations: 0

                };

            }


            registrationsByDate[date]
                .registrations += 1;

        }
    );


    const registrationsOverTime =
        Object.values(
            registrationsByDate
        ).sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    // ========================================================
    // ANALYTICS — PASS / FAIL
    // ========================================================

    const passFailRatio = [

        {
            name: "Passed",
            value: passedAttempts
        },

        {
            name: "Failed",
            value: failedAttempts
        }

    ];


    // ========================================================
    // ANALYTICS — POPULAR QUIZZES
    // ========================================================

    const popularQuizzes =
        quizReports
            .map((quiz) => ({

                id:
                    quiz.id,

                title:
                    quiz.title,

                attempts:
                    quiz.attempts,

                averageScore:
                    quiz.averageScore

            }))
            .sort(
                (a, b) =>
                    b.attempts -
                    a.attempts
            )
            .slice(0, 10);


    // ========================================================
    // ANALYTICS — CATEGORY PERFORMANCE
    // ========================================================

    const categoryMap = {};


    quizReports.forEach(
        (quiz) => {

            const category =
                quiz.category ||
                "Uncategorized";


            if (
                !categoryMap[category]
            ) {

                categoryMap[category] = {

                    category,

                    quizzes: 0,

                    attempts: 0,

                    passed: 0,

                    failed: 0,

                    scoreTotal: 0

                };

            }


            categoryMap[category]
                .quizzes += 1;


            categoryMap[category]
                .attempts +=
                quiz.attempts;


            categoryMap[category]
                .passed +=
                quiz.passed;


            categoryMap[category]
                .failed +=
                quiz.failed;


            categoryMap[category]
                .scoreTotal +=
                quiz.averageScore *
                quiz.attempts;

        }
    );


    const categoryPerformance =
        Object.values(
            categoryMap
        ).map((category) => {

            const completed =
                category.passed +
                category.failed;


            return {

                category:
                    category.category,

                quizzes:
                    category.quizzes,

                attempts:
                    category.attempts,

                passed:
                    category.passed,

                failed:
                    category.failed,

                averageScore:
                    category.attempts === 0
                        ? 0
                        : Number(
                            (
                                category.scoreTotal /
                                category.attempts
                            ).toFixed(2)
                        ),

                passRate:
                    completed === 0
                        ? 0
                        : Number(
                            (
                                (category.passed /
                                    completed) *
                                100
                            ).toFixed(2)
                        )

            };

        });


    // ========================================================
    // ANALYTICS — TOP STUDENTS
    // ========================================================

    const topStudents =
        studentReports
            .slice(0, 10)
            .map((student, index) => ({

                rank:
                    index + 1,

                id:
                    student.id,

                name:
                    student.name,

                email:
                    student.email,

                attempts:
                    student.attempts,

                passed:
                    student.passed,

                averageScore:
                    student.averageScore

            }));


    // ========================================================
    // RETURN COMPLETE REPORT
    // ========================================================

    return {

        overview: {

            totalStudents:
                students.length,

            totalQuizzes:
                quizzes.length,

            totalQuestions:
                quizzes.reduce(
                    (sum, quiz) =>
                        sum +
                        quiz.questions.length,
                    0
                ),

            totalAttempts,

            passedAttempts,

            failedAttempts,

            inProgressAttempts,

            averageScore,

            passRate

        },


        quizReports,


        studentReports,


        recentAttempts,


        analytics: {

            attemptsOverTime,

            registrationsOverTime,

            passFailRatio,

            popularQuizzes,

            categoryPerformance,

            topStudents

        }

    };

};