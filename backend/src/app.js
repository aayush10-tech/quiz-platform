import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import questionRoutes from "./routes/question.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

import errorHandler from "./middleware/error.middleware.js";

const app = express();


// =====================================================
// SECURITY
// =====================================================

app.disable("x-powered-by");

app.use(
    helmet()
);


// =====================================================
// CORS
// =====================================================

const allowedOrigins = [

    "http://localhost:5173",

    "http://127.0.0.1:5173",

    "https://quiz-platform-website.onrender.com",

    process.env.FRONTEND_URL

].filter(Boolean);


app.use(
    cors({

        origin: (origin, callback) => {

            // Allow requests without Origin
            // such as Postman/server-to-server requests.

            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            if (
                allowedOrigins.includes(origin)
            ) {

                return callback(
                    null,
                    true
                );

            }


            console.error(
                `CORS blocked origin: ${origin}`
            );

            return callback(
                new Error(
                    "CORS policy: Origin not allowed"
                )
            );

        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]

    })
);


// =====================================================
// REQUEST BODY LIMIT
// =====================================================

app.use(
    express.json({
        limit: "1mb"
    })
);


// =====================================================
// COMPRESSION
// =====================================================

app.use(
    compression()
);


// =====================================================
// GLOBAL RATE LIMIT
// =====================================================

const globalLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: 300,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many requests. Please try again later."
    }

});

app.use(
    "/api",
    globalLimiter
);


// =====================================================
// AUTH RATE LIMIT
// =====================================================

const authLimiter = rateLimit({

    windowMs: 1 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many authentication attempts. Please try again later."
    }

});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {

    return res.json({

        success: true,

        message:
            "Quiz Platform API is running 🚀"

    });

});


// =====================================================
// API ROUTES
// =====================================================

app.use(
    "/api/auth",
    authLimiter,
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/quizzes",
    quizRoutes
);

app.use(
    "/api/questions",
    questionRoutes
);

app.use(
    "/api/attempts",
    attemptRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/leaderboard",
    leaderboardRoutes
);

app.use(
    "/api/reports",
    reportsRoutes
);


// =====================================================
// 404 API HANDLER
// =====================================================

app.use((req, res) => {

    return res.status(404).json({

        success: false,

        message:
            "API endpoint not found"

    });

});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(errorHandler);


export default app;
