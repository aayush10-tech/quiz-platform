import prisma from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/password.js";


/* =========================================================
   SEED DATA
========================================================= */

const ADMIN_PASSWORD = "Admin@12345";
const STUDENT_PASSWORD = "Student@12345";


/* =========================================================
   HELPERS
========================================================= */

const createOrGetUser = async ({
    name,
    email,
    password,
    role
}) => {

    const hashedPassword =
        await hashPassword(password);

    return await prisma.user.upsert({

        where: {
            email
        },

        update: {

            name,

            role,

            status: "ACTIVE"

        },

        create: {

            name,

            email,

            password: hashedPassword,

            role,

            status: "ACTIVE"

        }

    });

};


const createOrGetCategory = async ({
    name,
    slug,
    description
}) => {

    return await prisma.category.upsert({

        where: {
            slug
        },

        update: {

            name,

            description

        },

        create: {

            name,

            slug,

            description

        }

    });

};


const createQuizIfMissing = async ({
    title,
    slug,
    description,
    instructions,
    duration,
    passingScore,
    maxAttempts,
    difficulty,
    categoryId,
    createdBy,
    isFeatured,
    status,
    questions
}) => {

    const existingQuiz =
        await prisma.quiz.findUnique({

            where: {
                slug
            }

        });


    if (existingQuiz) {

        return await prisma.quiz.findUnique({

            where: {
                id: existingQuiz.id
            },

            include: {

                questions: {

                    include: {

                        options: true

                    },

                    orderBy: {

                        questionOrder: "asc"

                    }

                }

            }

        });

    }


    return await prisma.quiz.create({

        data: {

            title,

            slug,

            description,

            instructions,

            duration,

            passingScore,

            maxAttempts,

            difficulty,

            categoryId,

            createdBy,

            isFeatured,

            status,

            questions: {

                create:

                    questions.map(
                        (question, index) => ({

                            questionText:
                                question.questionText,

                            explanation:
                                question.explanation,

                            marks:
                                question.marks ?? 1,

                            questionOrder:
                                index + 1,

                            options: {

                                create:
                                    question.options.map(
                                        option => ({

                                            optionText:
                                                option.optionText,

                                            isCorrect:
                                                option.isCorrect

                                        })
                                    )

                            }

                        })
                    )

            }

        },

        include: {

            questions: {

                include: {

                    options: true

                },

                orderBy: {

                    questionOrder: "asc"

                }

            }

        }

    });

};


/* =========================================================
   CREATE ATTEMPT
========================================================= */

const createAttemptIfMissing = async ({
    userId,
    quiz,
    passed
}) => {

    const existing =
        await prisma.attempt.findFirst({

            where: {

                userId,

                quizId: quiz.id

            }

        });


    if (existing) {

        return existing;

    }


    const questions =
        quiz.questions;


    const selectedAnswers = [];


    /*
     * PASSED ATTEMPT
     *
     * Select all correct answers.
     */

    if (passed) {

        for (const question of questions) {

            const correctOption =
                question.options.find(
                    option =>
                        option.isCorrect
                );


            if (correctOption) {

                selectedAnswers.push({

                    questionId:
                        question.id,

                    optionId:
                        correctOption.id,

                    isCorrect: true

                });

            }

        }

    }


    /*
     * FAILED ATTEMPT
     *
     * Select an incorrect option where possible.
     */

    else {

        for (const question of questions) {

            const incorrectOption =
                question.options.find(
                    option =>
                        !option.isCorrect
                );


            if (incorrectOption) {

                selectedAnswers.push({

                    questionId:
                        question.id,

                    optionId:
                        incorrectOption.id,

                    isCorrect: false

                });

            }

        }

    }


    const correctAnswers =
        selectedAnswers.filter(
            answer =>
                answer.isCorrect
        ).length;


    const incorrectAnswers =
        selectedAnswers.filter(
            answer =>
                !answer.isCorrect
        ).length;


    const unanswered =
        Math.max(
            0,
            questions.length -
            selectedAnswers.length
        );


    const score =
        correctAnswers;


    const percentage =
        questions.length === 0

            ? 0

            : Number(

                (
                    score /
                    questions.length
                ) * 100

            );


    const status =
        percentage >= quiz.passingScore

            ? "PASSED"

            : "FAILED";


    const startedAt =
        new Date(
            Date.now() -
            Math.floor(
                Math.random() *
                7 *
                24 *
                60 *
                60 *
                1000
            )
        );


    const completedAt =
        new Date(
            startedAt.getTime() +
            5 * 60 * 1000
        );


    const attempt =
        await prisma.attempt.create({

            data: {

                score,

                percentage,

                correctAnswers,

                incorrectAnswers,

                unanswered,

                timeTaken: 300,

                status,

                startedAt,

                completedAt,

                userId,

                quizId: quiz.id,

                answers: {

                    create:

                        selectedAnswers.map(
                            answer => ({

                                questionId:
                                    answer.questionId,

                                selectedOptionId:
                                    answer.optionId,

                                isCorrect:
                                    answer.isCorrect

                            })
                        )

                }

            }

        });


    return attempt;

};


/* =========================================================
   MAIN SEED
========================================================= */

const main = async () => {

    console.log("");
    console.log("======================================");
    console.log("       QUIZ PLATFORM SEED START");
    console.log("======================================");
    console.log("");


    /* =====================================================
       ADMINS
    ===================================================== */

    const admin1 =
        await createOrGetUser({

            name: "Main Admin",

            email: "admin@quizplatform.com",

            password:
                ADMIN_PASSWORD,

            role: "ADMIN"

        });


    const admin2 =
        await createOrGetUser({

            name: "Quiz Manager",

            email: "admin2@quizplatform.com",

            password:
                ADMIN_PASSWORD,

            role: "ADMIN"

        });


    console.log("✓ Admin users ready");


    /* =====================================================
       STUDENTS
    ===================================================== */

    const students = [];


    const studentData = [

        {
            name: "Rahul Sharma",
            email: "rahul@quizplatform.com"
        },

        {
            name: "Priya Patel",
            email: "priya@quizplatform.com"
        },

        {
            name: "Amit Kumar",
            email: "amit@quizplatform.com"
        },

        {
            name: "Sneha Joshi",
            email: "sneha@quizplatform.com"
        },

        {
            name: "Rohan Singh",
            email: "rohan@quizplatform.com"
        },

        {
            name: "Neha Verma",
            email: "neha@quizplatform.com"
        },

        {
            name: "Arjun Mehta",
            email: "arjun@quizplatform.com"
        },

        {
            name: "Kavya Shah",
            email: "kavya@quizplatform.com"
        }

    ];


    for (
        const student
        of studentData
    ) {

        const user =
            await createOrGetUser({

                name:
                    student.name,

                email:
                    student.email,

                password:
                    STUDENT_PASSWORD,

                role:
                    "STUDENT"

            });


        students.push(user);

    }


    console.log(
        `✓ ${students.length} student users ready`
    );


    /* =====================================================
       CATEGORIES
    ===================================================== */

    const javascript =
        await createOrGetCategory({

            name: "JavaScript",

            slug: "javascript",

            description:
                "JavaScript programming fundamentals"

        });


    const python =
        await createOrGetCategory({

            name: "Python",

            slug: "python",

            description:
                "Python programming fundamentals"

        });


    const database =
        await createOrGetCategory({

            name: "Database",

            slug: "database",

            description:
                "SQL and database concepts"

        });


    const webDevelopment =
        await createOrGetCategory({

            name: "Web Development",

            slug: "web-development",

            description:
                "HTML, CSS and web development"

        });


    console.log("✓ Categories ready");


    /* =====================================================
       QUIZ 1 — JAVASCRIPT
    ===================================================== */

    const javascriptQuiz =
        await createQuizIfMissing({

            title:
                "JavaScript Fundamentals",

            slug:
                "seed-javascript-fundamentals",

            description:
                "Test your knowledge of JavaScript fundamentals.",

            instructions:
                "Read each question carefully and select the best answer.",

            duration:
                20,

            passingScore:
                60,

            maxAttempts:
                3,

            difficulty:
                "MEDIUM",

            categoryId:
                javascript.id,

            createdBy:
                admin1.id,

            isFeatured:
                true,

            status:
                "PUBLISHED",

            questions: [

                {

                    questionText:
                        "Which keyword is used to declare a constant in JavaScript?",

                    explanation:
                        "The const keyword creates a block-scoped constant.",

                    options: [

                        {
                            optionText: "let",
                            isCorrect: false
                        },

                        {
                            optionText: "const",
                            isCorrect: true
                        },

                        {
                            optionText: "var",
                            isCorrect: false
                        },

                        {
                            optionText: "static",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which keyword is used to declare a variable in JavaScript?",

                    explanation:
                        "var is a traditional JavaScript variable declaration keyword.",

                    options: [

                        {
                            optionText: "var",
                            isCorrect: true
                        },

                        {
                            optionText: "define",
                            isCorrect: false
                        },

                        {
                            optionText: "variable",
                            isCorrect: false
                        },

                        {
                            optionText: "declare",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which method converts JSON text into a JavaScript object?",

                    explanation:
                        "JSON.parse() converts JSON text into a JavaScript object.",

                    options: [

                        {
                            optionText: "JSON.parse()",
                            isCorrect: true
                        },

                        {
                            optionText: "JSON.stringify()",
                            isCorrect: false
                        },

                        {
                            optionText: "JSON.convert()",
                            isCorrect: false
                        },

                        {
                            optionText: "JSON.object()",
                            isCorrect: false
                        }

                    ]

                }

            ]

        });


    /* =====================================================
       QUIZ 2 — PYTHON
    ===================================================== */

    const pythonQuiz =
        await createQuizIfMissing({

            title:
                "Python Programming Basics",

            slug:
                "seed-python-programming-basics",

            description:
                "Test basic Python programming knowledge.",

            instructions:
                "Choose the correct answer for every question.",

            duration:
                15,

            passingScore:
                60,

            maxAttempts:
                3,

            difficulty:
                "EASY",

            categoryId:
                python.id,

            createdBy:
                admin1.id,

            isFeatured:
                true,

            status:
                "PUBLISHED",

            questions: [

                {

                    questionText:
                        "Which keyword defines a function in Python?",

                    explanation:
                        "Python uses the def keyword to define functions.",

                    options: [

                        {
                            optionText: "def",
                            isCorrect: true
                        },

                        {
                            optionText: "function",
                            isCorrect: false
                        },

                        {
                            optionText: "fun",
                            isCorrect: false
                        },

                        {
                            optionText: "define",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which data type stores an ordered collection that can be changed?",

                    explanation:
                        "A Python list is ordered and mutable.",

                    options: [

                        {
                            optionText: "List",
                            isCorrect: true
                        },

                        {
                            optionText: "Tuple",
                            isCorrect: false
                        },

                        {
                            optionText: "String",
                            isCorrect: false
                        },

                        {
                            optionText: "Integer",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which symbol is used for comments in Python?",

                    explanation:
                        "Python comments begin with #.",

                    options: [

                        {
                            optionText: "#",
                            isCorrect: true
                        },

                        {
                            optionText: "//",
                            isCorrect: false
                        },

                        {
                            optionText: "/*",
                            isCorrect: false
                        },

                        {
                            optionText: "<!--",
                            isCorrect: false
                        }

                    ]

                }

            ]

        });


    /* =====================================================
       QUIZ 3 — DATABASE
    ===================================================== */

    const databaseQuiz =
        await createQuizIfMissing({

            title:
                "Database Fundamentals",

            slug:
                "seed-database-fundamentals",

            description:
                "Test knowledge of SQL and relational databases.",

            instructions:
                "Select the most appropriate answer.",

            duration:
                20,

            passingScore:
                60,

            maxAttempts:
                3,

            difficulty:
                "MEDIUM",

            categoryId:
                database.id,

            createdBy:
                admin2.id,

            isFeatured:
                false,

            status:
                "PUBLISHED",

            questions: [

                {

                    questionText:
                        "Which SQL command is used to retrieve data?",

                    explanation:
                        "SELECT retrieves data from database tables.",

                    options: [

                        {
                            optionText: "SELECT",
                            isCorrect: true
                        },

                        {
                            optionText: "GET",
                            isCorrect: false
                        },

                        {
                            optionText: "FETCH ALL",
                            isCorrect: false
                        },

                        {
                            optionText: "READ",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which key uniquely identifies a record in a table?",

                    explanation:
                        "A primary key uniquely identifies each row.",

                    options: [

                        {
                            optionText: "Primary Key",
                            isCorrect: true
                        },

                        {
                            optionText: "Foreign Key",
                            isCorrect: false
                        },

                        {
                            optionText: "Secondary Key",
                            isCorrect: false
                        },

                        {
                            optionText: "Index Key",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which SQL command adds a new row?",

                    explanation:
                        "INSERT INTO adds new records.",

                    options: [

                        {
                            optionText: "INSERT",
                            isCorrect: true
                        },

                        {
                            optionText: "ADD",
                            isCorrect: false
                        },

                        {
                            optionText: "CREATE ROW",
                            isCorrect: false
                        },

                        {
                            optionText: "APPEND",
                            isCorrect: false
                        }

                    ]

                }

            ]

        });


    /* =====================================================
       QUIZ 4 — WEB DEVELOPMENT
    ===================================================== */

    const webQuiz =
        await createQuizIfMissing({

            title:
                "Web Development Essentials",

            slug:
                "seed-web-development-essentials",

            description:
                "Test knowledge of HTML, CSS and web development.",

            instructions:
                "Read every question carefully.",

            duration:
                15,

            passingScore:
                60,

            maxAttempts:
                3,

            difficulty:
                "EASY",

            categoryId:
                webDevelopment.id,

            createdBy:
                admin2.id,

            isFeatured:
                false,

            status:
                "PUBLISHED",

            questions: [

                {

                    questionText:
                        "Which HTML element is used for the largest heading?",

                    explanation:
                        "h1 represents the highest-level heading.",

                    options: [

                        {
                            optionText: "<h1>",
                            isCorrect: true
                        },

                        {
                            optionText: "<head>",
                            isCorrect: false
                        },

                        {
                            optionText: "<heading>",
                            isCorrect: false
                        },

                        {
                            optionText: "<title>",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which language is used to style HTML pages?",

                    explanation:
                        "CSS controls the visual presentation of web pages.",

                    options: [

                        {
                            optionText: "CSS",
                            isCorrect: true
                        },

                        {
                            optionText: "SQL",
                            isCorrect: false
                        },

                        {
                            optionText: "JSON",
                            isCorrect: false
                        },

                        {
                            optionText: "XML",
                            isCorrect: false
                        }

                    ]

                },

                {

                    questionText:
                        "Which CSS property changes text color?",

                    explanation:
                        "The color property controls text color.",

                    options: [

                        {
                            optionText: "color",
                            isCorrect: true
                        },

                        {
                            optionText: "font-color",
                            isCorrect: false
                        },

                        {
                            optionText: "text-color",
                            isCorrect: false
                        },

                        {
                            optionText: "foreground",
                            isCorrect: false
                        }

                    ]

                }

            ]

        });


    /* =====================================================
       DRAFT QUIZ
    ===================================================== */

    await createQuizIfMissing({

        title:
            "Advanced JavaScript - Draft",

        slug:
            "seed-advanced-javascript-draft",

        description:
            "Draft quiz used to test admin publishing controls.",

        instructions:
            "This quiz should not be visible to students.",

        duration:
            30,

        passingScore:
            70,

        maxAttempts:
            2,

        difficulty:
            "HARD",

        categoryId:
            javascript.id,

        createdBy:
            admin1.id,

        isFeatured:
            false,

        status:
            "DRAFT",

        questions: [

            {

                questionText:
                    "Which mechanism manages asynchronous operations in JavaScript?",

                explanation:
                    "Promises and async/await are commonly used for asynchronous operations.",

                options: [

                    {
                        optionText: "Promises",
                        isCorrect: true
                    },

                    {
                        optionText: "CSS",
                        isCorrect: false
                    },

                    {
                        optionText: "SQL",
                        isCorrect: false
                    },

                    {
                        optionText: "HTML",
                        isCorrect: false
                    }

                ]

            }

        ]

    });


    console.log("✓ Quizzes and questions ready");


    /* =====================================================
       SAMPLE ATTEMPTS
    ===================================================== */

    const quizzes = [

        javascriptQuiz,

        pythonQuiz,

        databaseQuiz,

        webQuiz

    ];


    /*
     * Create varied results.
     *
     * First four students → passed
     * Last four students → failed
     */

    for (
        let i = 0;
        i < students.length;
        i++
    ) {

        const student =
            students[i];


        for (
            let j = 0;
            j < quizzes.length;
            j++
        ) {

            const quiz =
                quizzes[j];


            /*
             * Vary results so reports and
             * leaderboard look realistic.
             */

            const passed =
                (i + j) % 3 !== 0;


            await createAttemptIfMissing({

                userId:
                    student.id,

                quiz,

                passed

            });

        }

    }


    console.log(
        "✓ Sample attempts and answers ready"
    );


    /* =====================================================
       SUMMARY
    ===================================================== */

    const counts = {

        users:
            await prisma.user.count(),

        students:
            await prisma.user.count({

                where: {
                    role: "STUDENT"
                }

            }),

        admins:
            await prisma.user.count({

                where: {
                    role: "ADMIN"
                }

            }),

        categories:
            await prisma.category.count(),

        quizzes:
            await prisma.quiz.count(),

        questions:
            await prisma.question.count(),

        attempts:
            await prisma.attempt.count(),

        answers:
            await prisma.answer.count()

    };


    console.log("");
    console.log("======================================");
    console.log("       QUIZ PLATFORM SEED COMPLETE");
    console.log("======================================");
    console.log("");
    console.log(`Users:       ${counts.users}`);
    console.log(`Students:    ${counts.students}`);
    console.log(`Admins:      ${counts.admins}`);
    console.log(`Categories:  ${counts.categories}`);
    console.log(`Quizzes:     ${counts.quizzes}`);
    console.log(`Questions:   ${counts.questions}`);
    console.log(`Attempts:    ${counts.attempts}`);
    console.log(`Answers:     ${counts.answers}`);
    console.log("");
    console.log("LOGIN ACCOUNTS");
    console.log("--------------------------------------");
    console.log("");
    console.log("Admin:");
    console.log("Email:    admin@quizplatform.com");
    console.log("Password: Admin@12345");
    console.log("");
    console.log("Second Admin:");
    console.log("Email:    admin2@quizplatform.com");
    console.log("Password: Admin@12345");
    console.log("");
    console.log("Students:");
    console.log("Password for all seeded students:");
    console.log("Student@12345");
    console.log("");
    console.log("Example student:");
    console.log("Email:    rahul@quizplatform.com");
    console.log("Password: Student@12345");
    console.log("");
    console.log("======================================");
    console.log("");

};


main()

    .catch(error => {

        console.error("");
        console.error("SEED FAILED");
        console.error("");
        console.error(error);
        process.exit(1);

    })

    .finally(async () => {

        await prisma.$disconnect();

    });