import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getQuizById
} from "../../../services/quiz.service";

import {
    startAttempt
} from "../../../services/attempt.service";


export default function QuizDetails() {

    const { quizId } = useParams();

    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [starting, setStarting] =
        useState(false);

    const [error, setError] =
        useState("");


    /* =========================================================
       LOAD QUIZ
    ========================================================= */

    useEffect(() => {

        const loadQuiz = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getQuizById(quizId);

                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to load quiz"
                    );

                }

                setQuiz(response.data);

            } catch (err) {

                console.error(
                    "Quiz Details Error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load quiz"
                );

            } finally {

                setLoading(false);

            }

        };

        loadQuiz();

    }, [quizId]);


    /* =========================================================
       START ATTEMPT
    ========================================================= */

    const handleStart = async () => {

        try {

            setStarting(true);

            setError("");

            const response =
                await startAttempt(quizId);

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to start quiz"
                );

            }

            const attempt =
                response.data;

            navigate(
                `/student/quiz/${quizId}/attempt/${attempt.id}`
            );

        } catch (err) {

            console.error(
                "Start Attempt Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to start quiz"
            );

        } finally {

            setStarting(false);

        }

    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div style={styles.page}>

                <div style={styles.card}>

                    <div style={styles.loadingIcon}>
                        ⏳
                    </div>

                    <h2 style={styles.loadingTitle}>
                        Loading Quiz...
                    </h2>

                    <p style={styles.loadingText}>
                        Please wait while we load
                        the quiz details.
                    </p>

                </div>

            </div>

        );

    }


    /* =========================================================
       ERROR WITHOUT QUIZ
    ========================================================= */

    if (error && !quiz) {

        return (

            <div style={styles.page}>

                <div style={styles.errorCard}>

                    <div style={styles.errorIcon}>
                        ⚠️
                    </div>

                    <h2 style={styles.errorTitle}>
                        Unable to Load Quiz
                    </h2>

                    <p style={styles.errorMessage}>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/quizzes"
                            )
                        }
                        style={styles.secondaryButton}
                    >
                        ← Back to Quizzes
                    </button>

                </div>

            </div>

        );

    }


    /* =========================================================
       QUESTION COUNT
    ========================================================= */

    const questionCount =
        quiz?._count?.questions ??
        quiz?.questionCount ??
        quiz?.questions?.length ??
        0;


    /* =========================================================
       MAIN PAGE
    ========================================================= */

    return (

        <div style={styles.page}>

            {/* BACK */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/student/quizzes"
                    )
                }
                style={styles.backButton}
            >
                ← Back to Quizzes
            </button>


            {/* START ERROR */}

            {error && (

                <div style={styles.error}>

                    <strong>
                        Unable to start quiz
                    </strong>

                    <div
                        style={{
                            marginTop: "5px"
                        }}
                    >
                        {error}
                    </div>

                </div>

            )}


            {/* QUIZ CARD */}

            <div style={styles.card}>

                {/* =================================================
                    HEADER
                ================================================== */}

                <div style={styles.header}>

                    <div>

                        <span
                            style={{
                                ...styles.difficulty,
                                ...(quiz.difficulty ===
                                "EASY"
                                    ? styles.easyDifficulty
                                    : quiz.difficulty ===
                                      "HARD"
                                    ? styles.hardDifficulty
                                    : styles.mediumDifficulty)
                            }}
                        >
                            {quiz.difficulty ||
                                "MEDIUM"}
                        </span>


                        <h1 style={styles.title}>
                            {quiz.title}
                        </h1>


                        <p style={styles.description}>
                            {quiz.description ||
                                "Test your knowledge with this quiz."}
                        </p>

                    </div>

                </div>


                {/* =================================================
                    QUIZ INFORMATION
                ================================================== */}

                <div style={styles.infoGrid}>

                    <Info
                        icon="📝"
                        label="Questions"
                        value={questionCount}
                    />


                    <Info
                        icon="⏱️"
                        label="Duration"
                        value={`${quiz.duration || 0} minutes`}
                    />


                    <Info
                        icon="🎯"
                        label="Passing Score"
                        value={`${quiz.passingScore || 0}%`}
                    />


                    <Info
                        icon="🔄"
                        label="Maximum Attempts"
                        value={
                            quiz.maxAttempts ??
                            "Unlimited"
                        }
                    />


                    <Info
                        icon="📚"
                        label="Category"
                        value={
                            quiz.category?.name ||
                            "General"
                        }
                    />

                </div>


                {/* =================================================
                    INSTRUCTIONS
                ================================================== */}

                {quiz.instructions && (

                    <div style={styles.instructions}>

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "flex-start"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "22px"
                                }}
                            >
                                📋
                            </div>

                            <div>

                                <h2
                                    style={{
                                        margin:
                                            "0 0 10px",
                                        color:
                                            "#123d6b",
                                        fontSize:
                                            "20px"
                                    }}
                                >
                                    Instructions
                                </h2>

                                <p
                                    style={{
                                        margin: 0
                                    }}
                                >
                                    {quiz.instructions}
                                </p>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    BEFORE YOU START
                ================================================== */}

                <div style={styles.notice}>

                    <div
                        style={{
                            fontSize: "22px"
                        }}
                    >
                        ℹ️
                    </div>

                    <div>

                        <strong
                            style={{
                                color:
                                    "#123d6b"
                            }}
                        >
                            Before you start
                        </strong>

                        <p
                            style={{
                                margin:
                                    "5px 0 0",
                                color:
                                    "#64748b",
                                lineHeight: 1.5
                            }}
                        >
                            Make sure you have enough
                            time to complete the quiz.
                            Once you start, your attempt
                            will be recorded.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    ACTION
                ================================================== */}

                <div style={styles.actionArea}>

                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={starting}
                        style={{
                            ...styles.startButton,
                            ...(starting
                                ? styles.startButtonDisabled
                                : {})
                        }}
                    >

                        {starting ? (
                            <>
                                ⏳ Starting...
                            </>
                        ) : (
                            <>
                                Start Quiz →
                            </>
                        )}

                    </button>

                </div>

            </div>

        </div>

    );

}


/* =============================================================
   INFORMATION CARD
============================================================= */

function Info({
    icon,
    label,
    value
}) {

    return (

        <div style={styles.info}>

            <div style={styles.infoIcon}>
                {icon}
            </div>

            <div>

                <span style={styles.infoLabel}>
                    {label}
                </span>

                <strong style={styles.infoValue}>
                    {value}
                </strong>

            </div>

        </div>

    );

}


/* =============================================================
   STYLES
============================================================= */

const styles = {

    page: {
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px"
    },


    card: {
        maxWidth: "1000px",
        margin: "20px auto",
        background: "#fff",
        borderRadius: "16px",
        padding: "35px",
        boxShadow:
            "0 4px 18px rgba(0,0,0,.08)"
    },


    backButton: {
        border: "none",
        background: "transparent",
        color: "#2563eb",
        fontSize: "15px",
        cursor: "pointer",
        fontWeight: "600",
        padding: "8px 0"
    },


    header: {
        marginBottom: "25px"
    },


    difficulty: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },


    easyDifficulty: {
        background: "#dcfce7",
        color: "#15803d"
    },


    mediumDifficulty: {
        background: "#fef3c7",
        color: "#a16207"
    },


    hardDifficulty: {
        background: "#fee2e2",
        color: "#b91c1c"
    },


    title: {
        color: "#102a56",
        fontSize: "34px",
        margin: "14px 0 10px",
        lineHeight: 1.2
    },


    description: {
        color: "#64748b",
        fontSize: "16px",
        lineHeight: "1.6",
        margin: 0
    },


    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
        gap: "15px",
        marginTop: "25px"
    },


    info: {
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        border:
            "1px solid #eef2f7"
    },


    infoIcon: {
        fontSize: "23px",
        width: "32px",
        textAlign: "center"
    },


    infoLabel: {
        display: "block",
        color: "#64748b",
        fontSize: "13px",
        marginBottom: "7px"
    },


    infoValue: {
        color: "#102a56",
        fontSize: "18px"
    },


    instructions: {
        marginTop: "30px",
        padding: "22px",
        background: "#eff6ff",
        borderRadius: "10px",
        color: "#334155",
        lineHeight: "1.6"
    },


    notice: {
        marginTop: "20px",
        padding: "18px",
        background: "#f8fafc",
        border:
            "1px solid #e2e8f0",
        borderRadius: "10px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start"
    },


    actionArea: {
        marginTop: "30px",
        display: "flex",
        justifyContent: "flex-end"
    },


    startButton: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "14px 28px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        minWidth: "150px"
    },


    startButtonDisabled: {
        background: "#94a3b8",
        cursor: "not-allowed"
    },


    secondaryButton: {
        border: "none",
        background: "#e2e8f0",
        color: "#102a56",
        padding: "12px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
    },


    error: {
        maxWidth: "1000px",
        margin: "20px auto",
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "15px",
        borderRadius: "8px"
    },


    errorCard: {
        maxWidth: "600px",
        margin: "60px auto",
        background: "#fff",
        borderRadius: "16px",
        padding: "40px",
        textAlign: "center",
        boxShadow:
            "0 4px 18px rgba(0,0,0,.08)"
    },


    errorIcon: {
        fontSize: "45px",
        marginBottom: "15px"
    },


    errorTitle: {
        color: "#102a56",
        marginBottom: "10px"
    },


    errorMessage: {
        color: "#64748b",
        lineHeight: 1.5,
        marginBottom: "25px"
    },


    loadingIcon: {
        fontSize: "40px",
        textAlign: "center"
    },


    loadingTitle: {
        textAlign: "center",
        color: "#102a56",
        marginBottom: "8px"
    },


    loadingText: {
        textAlign: "center",
        color: "#64748b"
    }

};