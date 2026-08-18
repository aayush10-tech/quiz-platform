import prisma from "../config/prisma.js";

export const getStudentsService = async ({
    page = 1,
    limit = 10,
    search = "",
    status = ""
}) => {

    const skip = (page - 1) * limit;

    const where = {
        role: "STUDENT"
    };

    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            {
                email: {
                    contains: search,
                    mode: "insensitive"
                }
            }
        ];
    }

    if (status === "ACTIVE" || status === "INACTIVE") {
        where.status = status;
    }

    const [students, total] = await Promise.all([

        prisma.user.findMany({
            where,
            skip,
            take: limit,

            orderBy: {
                createdAt: "desc"
            },

            include: {
                attempts: {
                    select: {
                        id: true,
                        percentage: true,
                        status: true
                    }
                }
            }
        }),

        prisma.user.count({
            where
        })

    ]);

    const formattedStudents = students.map(student => {

        const attempts = student.attempts;

        const passed = attempts.filter(
            attempt => attempt.status === "PASSED"
        ).length;

        const failed = attempts.filter(
            attempt => attempt.status === "FAILED"
        ).length;

        const totalPercentage = attempts.reduce(
            (sum, attempt) => sum + attempt.percentage,
            0
        );

        const averageScore =
            attempts.length === 0
                ? 0
                : Number(
                    (
                        totalPercentage / attempts.length
                    ).toFixed(2)
                );

        return {
            id: student.id,
            name: student.name,
            email: student.email,
            status: student.status,
            createdAt: student.createdAt,
            attempts: attempts.length,
            passed,
            failed,
            averageScore
        };
    });

    return {
        students: formattedStudents,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};


export const getStudentByIdService = async (studentId) => {

    const student = await prisma.user.findFirst({
        where: {
            id: studentId,
            role: "STUDENT"
        },

        include: {
            attempts: {
                orderBy: {
                    startedAt: "desc"
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
                }
            }
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    const passed = student.attempts.filter(
        attempt => attempt.status === "PASSED"
    ).length;

    const failed = student.attempts.filter(
        attempt => attempt.status === "FAILED"
    ).length;

    const totalPercentage = student.attempts.reduce(
        (sum, attempt) => sum + attempt.percentage,
        0
    );

    const averageScore =
        student.attempts.length === 0
            ? 0
            : Number(
                (
                    totalPercentage /
                    student.attempts.length
                ).toFixed(2)
            );

    return {
        id: student.id,
        name: student.name,
        email: student.email,
        status: student.status,
        createdAt: student.createdAt,

        statistics: {
            totalAttempts: student.attempts.length,
            passed,
            failed,
            averageScore
        },

        attempts: student.attempts
    };
};


export const updateStudentStatusService = async (
    studentId,
    status
) => {

    if (
        status !== "ACTIVE" &&
        status !== "INACTIVE"
    ) {
        throw new Error("Invalid student status");
    }

    const student = await prisma.user.findFirst({
        where: {
            id: studentId,
            role: "STUDENT"
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    return prisma.user.update({
        where: {
            id: studentId
        },

        data: {
            status
        },

        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
        }
    });
};


export const deleteStudentService = async (studentId) => {

    const student = await prisma.user.findFirst({
        where: {
            id: studentId,
            role: "STUDENT"
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    /*
     * Attempts belong to the student.
     * Delete attempts first because the User -> Attempt
     * relation in the current Prisma schema does not have
     * onDelete: Cascade.
     */

    await prisma.$transaction(async transaction => {

        await transaction.attempt.deleteMany({
            where: {
                userId: studentId
            }
        });

        await transaction.user.delete({
            where: {
                id: studentId
            }
        });

    });

    return {
        id: studentId
    };
};