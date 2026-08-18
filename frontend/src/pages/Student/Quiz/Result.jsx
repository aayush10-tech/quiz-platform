import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getAttemptResult
} from "../../../services/attempt.service";


export default function Result() {

    const { attemptId } = useParams();

    const navigate = useNavigate();

    const [result, setResult] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadResult = async () => {

            try {

                const response =
                    await getAttemptResult(
                        attemptId
                    );

                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to load result"
                    );

                }

                setResult(
                    response.data
                );

            } catch (err) {

                console.error(err);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load result"
                );

            } finally {

                setLoading(false);

            }

        };

        loadResult();

    }, [attemptId]);


    if (loading) {

        return (
            <div style={styles.center}>
                Loading result...
            </div>
        );

    }


    if (error) {

        return (
            <div style={styles.center}>

                <div style={styles.error}>
                    {error}
                </div>

                <button
                    onClick={() =>
                        navigate("/student")
                    }
                    style={styles.button}
                >
                    Dashboard
                </button>

            </div>
        );

    }


    const passed =
        result.status === "PASSED";


    return (

        <div style={styles.page}>

            <div style={styles.card}>

                <div
                    style={{
                        ...styles.resultIcon,
                        background:
                            passed
                                ? "#dcfce7"
                                : "#fee2e2",
                        color:
                            passed
                                ? "#15803d"
                                : "#b91c1c"
                    }}
                >
                    {passed ? "✓" : "×"}
                </div>


                <h1 style={styles.title}>
                    {passed
                        ? "Congratulations!"
                        : "Quiz Completed"}
                </h1>


                <p style={styles.quizTitle}>
                    {result.quiz?.title}
                </p>


                <div
                    style={{
                        ...styles.status,
                        background:
                            passed
                                ? "#dcfce7"
                                : "#fee2e2",
                        color:
                            passed
                                ? "#15803d"
                                : "#b91c1c"
                    }}
                >
                    {result.status}
                </div>


                <div style={styles.score}>

                    {Number(
                        result.percentage || 0
                    ).toFixed(1)}

                    <span>%</span>

                </div>


                <p style={styles.scoreText}>
                    Score: {result.score}
                </p>


                <div style={styles.stats}>

                    <Stat
                        label="Correct"
                        value={
                            result.correctAnswers
                        }
                        color="#15803d"
                    />

                    <Stat
                        label="Incorrect"
                        value={
                            result.incorrectAnswers
                        }
                        color="#b91c1c"
                    />

                    <Stat
                        label="Unanswered"
                        value={
                            result.unanswered
                        }
                        color="#a16207"
                    />

                    <Stat
                        label="Passing Score"
                        value={`${result.quiz?.passingScore}%`}
                        color="#2563eb"
                    />

                </div>


                <div style={styles.actions}>

                    <button
                        onClick={() =>
                            navigate("/student")
                        }
                        style={styles.button}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/student/attempts"
                            )
                        }
                        style={styles.secondaryButton}
                    >
                        Attempt History
                    </button>

                </div>

            </div>

        </div>

    );

}


function Stat({
    label,
    value,
    color
}) {

    return (

        <div style={styles.stat}>

            <div
                style={{
                    ...styles.statValue,
                    color
                }}
            >
                {value}
            </div>

            <div style={styles.statLabel}>
                {label}
            </div>

        </div>

    );

}


const styles = {

    page: {
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "50px 20px"
    },

    card: {
        maxWidth: "800px",
        margin: "auto",
        background: "#fff",
        borderRadius: "18px",
        padding: "45px",
        textAlign: "center",
        boxShadow:
            "0 5px 25px rgba(0,0,0,.08)"
    },

    resultIcon: {
        width: "75px",
        height: "75px",
        borderRadius: "50%",
        margin: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        fontWeight: "800"
    },

    title: {
        color: "#102a56",
        marginTop: "22px"
    },

    quizTitle: {
        color: "#64748b",
        fontSize: "17px"
    },

    status: {
        display: "inline-block",
        padding: "7px 16px",
        borderRadius: "20px",
        fontWeight: "800",
        marginTop: "10px"
    },

    score: {
        fontSize: "65px",
        fontWeight: "800",
        color: "#102a56",
        marginTop: "25px"
    },

    scoreText: {
        color: "#64748b"
    },

    stats: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4,1fr)",
        gap: "12px",
        marginTop: "30px"
    },

    stat: {
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "18px"
    },

    statValue: {
        fontSize: "25px",
        fontWeight: "800"
    },

    statLabel: {
        color: "#64748b",
        fontSize: "13px",
        marginTop: "5px"
    },

    actions: {
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        marginTop: "35px",
        flexWrap: "wrap"
    },

    button: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "13px 22px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer"
    },

    secondaryButton: {
        border: "none",
        background: "#e2e8f0",
        color: "#334155",
        padding: "13px 22px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer"
    },

    center: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    },

    error: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "15px",
        borderRadius: "8px"
    }

};