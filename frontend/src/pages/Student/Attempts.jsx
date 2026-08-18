import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMyAttempts
} from "../../services/attempt.service";


export default function Attempts() {

    const navigate = useNavigate();

    const [attempts, setAttempts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadAttempts = async () => {

            try {

                const response =
                    await getMyAttempts();

                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to load attempts"
                    );

                }

                setAttempts(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } catch (err) {

                console.error(err);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load attempts"
                );

            } finally {

                setLoading(false);

            }

        };


        loadAttempts();

    }, []);


    return (

        <div style={styles.page}>

            <div style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Attempt History
                    </h1>

                    <p style={styles.subtitle}>
                        View your previous quiz attempts.
                    </p>

                </div>


                <button
                    onClick={() =>
                        navigate("/student")
                    }
                    style={styles.button}
                >
                    ← Dashboard
                </button>

            </div>


            {loading && (

                <div style={styles.card}>
                    Loading attempts...
                </div>

            )}


            {error && (

                <div style={styles.error}>
                    {error}
                </div>

            )}


            {!loading &&
                !error &&
                attempts.length === 0 && (

                    <div style={styles.card}>
                        You haven't attempted any quizzes yet.
                    </div>

                )}


            {!loading &&
                attempts.length > 0 && (

                    <div style={styles.card}>

                        <div style={styles.tableWrapper}>

                            <table style={styles.table}>

                                <thead>

                                    <tr>

                                        <th style={styles.th}>
                                            Quiz
                                        </th>

                                        <th style={styles.th}>
                                            Difficulty
                                        </th>

                                        <th style={styles.th}>
                                            Score
                                        </th>

                                        <th style={styles.th}>
                                            Percentage
                                        </th>

                                        <th style={styles.th}>
                                            Status
                                        </th>

                                        <th style={styles.th}>
                                            Date
                                        </th>

                                        <th style={styles.th}>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {attempts.map(
                                        attempt => (

                                            <tr
                                                key={
                                                    attempt.id
                                                }
                                            >

                                                <td style={styles.td}>
                                                    <strong>
                                                        {
                                                            attempt.quiz?.title
                                                        }
                                                    </strong>
                                                </td>

                                                <td style={styles.td}>
                                                    {
                                                        attempt.quiz?.difficulty
                                                    }
                                                </td>

                                                <td style={styles.td}>
                                                    {
                                                        attempt.score
                                                    }
                                                </td>

                                                <td style={styles.td}>
                                                    {Number(
                                                        attempt.percentage ||
                                                        0
                                                    ).toFixed(1)}
                                                    %
                                                </td>

                                                <td style={styles.td}>

                                                    <span
                                                        style={
                                                            attempt.status ===
                                                            "PASSED"
                                                                ? styles.pass
                                                                : attempt.status ===
                                                                  "FAILED"
                                                                    ? styles.fail
                                                                    : styles.progress
                                                        }
                                                    >
                                                        {
                                                            attempt.status
                                                        }
                                                    </span>

                                                </td>

                                                <td style={styles.td}>
                                                    {new Date(
                                                        attempt.startedAt
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td style={styles.td}>

                                                    {attempt.status !==
                                                    "IN_PROGRESS" && (

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/student/result/${attempt.id}`
                                                                )
                                                            }
                                                            style={
                                                                styles.smallButton
                                                            }
                                                        >
                                                            View Result
                                                        </button>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

        </div>

    );

}


const styles = {

    page: {
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px"
    },

    header: {
        maxWidth: "1200px",
        margin: "0 auto 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
    },

    title: {
        color: "#102a56",
        margin: 0
    },

    subtitle: {
        color: "#64748b"
    },

    card: {
        maxWidth: "1200px",
        margin: "auto",
        background: "#fff",
        borderRadius: "14px",
        padding: "25px",
        boxShadow:
            "0 3px 12px rgba(0,0,0,.08)"
    },

    tableWrapper: {
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "800px"
    },

    th: {
        textAlign: "left",
        padding: "14px",
        background: "#f8fafc",
        color: "#334155",
        borderBottom:
            "1px solid #e2e8f0"
    },

    td: {
        padding: "14px",
        borderBottom:
            "1px solid #e2e8f0",
        color: "#334155"
    },

    pass: {
        background: "#dcfce7",
        color: "#15803d",
        padding: "5px 10px",
        borderRadius: "20px",
        fontWeight: "700",
        fontSize: "12px"
    },

    fail: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "5px 10px",
        borderRadius: "20px",
        fontWeight: "700",
        fontSize: "12px"
    },

    progress: {
        background: "#fef3c7",
        color: "#a16207",
        padding: "5px 10px",
        borderRadius: "20px",
        fontWeight: "700",
        fontSize: "12px"
    },

    button: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer"
    },

    smallButton: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer"
    },

    error: {
        maxWidth: "1200px",
        margin: "20px auto",
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "15px",
        borderRadius: "8px"
    }

};