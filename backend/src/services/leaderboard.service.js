import prisma from "../config/prisma.js";

export const getLeaderboardService = async () => {

    const students = await prisma.user.findMany({

        where: {
            role: "STUDENT"
        },

        select: {

            id: true,
            name: true,
            email: true,

            attempts: {

                select: {

                    percentage: true,
                    status: true,

                    quiz: {

                        select: {
                            passingScore: true
                        }

                    }

                }

            }

        }

    });


    const leaderboard = students.map(
        (student) => {

            const attempts =
                student.attempts || [];


            const completedAttempts =
                attempts.filter(
                    (attempt) =>
                        attempt.status === "PASSED" ||
                        attempt.status === "FAILED"
                );


            const totalAttempts =
                completedAttempts.length;


            const passed =
                completedAttempts.filter(
                    (attempt) => {

                        if (
                            attempt.status ===
                            "PASSED"
                        ) {
                            return true;
                        }

                        const percentage =
                            Number(
                                attempt.percentage || 0
                            );

                        const passingScore =
                            Number(
                                attempt.quiz?.passingScore || 0
                            );

                        return (
                            percentage >=
                            passingScore
                        );

                    }
                ).length;


            const failed =
                totalAttempts - passed;


            const totalPercentage =
                completedAttempts.reduce(
                    (
                        sum,
                        attempt
                    ) =>
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


            return {

                id:
                    student.id,

                name:
                    student.name,

                email:
                    student.email,

                attempts:
                    totalAttempts,

                passed,

                failed,

                averageScore

            };

        }
    );


    leaderboard.sort(
        (a, b) => {

            if (
                b.averageScore !==
                a.averageScore
            ) {

                return (
                    b.averageScore -
                    a.averageScore
                );

            }


            if (
                b.passed !==
                a.passed
            ) {

                return (
                    b.passed -
                    a.passed
                );

            }


            return (
                b.attempts -
                a.attempts
            );

        }
    );


    return leaderboard.map(
        (student, index) => ({

            rank:
                index + 1,

            ...student

        })
    );

};