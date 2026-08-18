import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getLeaderboard } from "../../services/leaderboard.service";
import api from "../../api/axios";

export default function Dashboard() {

    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAdminDashboard();
    }, []);

    const loadAdminDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/dashboard/admin");

            console.log("ADMIN DASHBOARD RESPONSE:", response.data);

            if (response.data?.success) {
                setDashboard(response.data.data);
            } else {
                setError(
                    response.data?.message ||
                    "Unable to load admin dashboard."
                );
            }

        } catch (err) {
            console.error(
                "Admin Dashboard Error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                Loading Admin Dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.page}>
                <div style={styles.error}>
                    <strong>Error:</strong> {error}
                </div>

                <button
                    onClick={loadAdminDashboard}
                    style={styles.refreshButton}
                >
                    Retry
                </button>
            </div>
        );
    }

    const stats = dashboard?.overview || dashboard || {};

    const recentAttempts =
        dashboard?.recentAttempts ||
        stats?.recentAttempts ||
        [];

    const topStudents =
        dashboard?.topStudents ||
        stats?.topStudents ||
        [];

    return (
        <div style={styles.page}>

            {/* HEADER */}

            <div style={styles.header}>

                <div>
                    <h1 style={styles.title}>
                        Admin Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Overview of your quiz platform.
                    </p>
                </div>

                <button
                    onClick={loadAdminDashboard}
                    style={styles.refreshButton}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* STATISTICS */}

            <div style={styles.statsGrid}>

                <StatCard
                    title="Users"
                    value={
                        stats.totalUsers ??
                        stats.users ??
                        stats.totalStudents ??
                        0
                    }
                />

                <StatCard
                    title="Quizzes"
                    value={
                        stats.totalQuizzes ??
                        stats.quizzes ??
                        0
                    }
                />

                <StatCard
                    title="Questions"
                    value={
                        stats.totalQuestions ??
                        stats.questions ??
                        0
                    }
                />

                <StatCard
                    title="Attempts"
                    value={
                        stats.totalAttempts ??
                        stats.attempts ??
                        0
                    }
                />

                <StatCard
                    title="Passed"
                    value={
    stats.passedAttempts ??
    stats.passed ??
    stats.totalPassed ??
    0
}
                    valueColor="#08a045"
                />

                <StatCard
                    title="Failed"
                    value={
    stats.failedAttempts ??
    stats.failed ??
    stats.totalFailed ??
    0
}
                    valueColor="#e00000"
                />

                <StatCard
                    title="Pass Rate"
                    value={`${Number(
                        stats.passRate ?? 0
                    ).toFixed(1)}%`}
                    valueColor="#2864e8"
                />

            </div>


            {/* RECENT ATTEMPTS */}

            <section style={styles.section}>

                <h2 style={styles.sectionTitle}>
                    Recent Attempts
                </h2>

                <div style={styles.tableCard}>

                    {recentAttempts.length === 0 ? (

                        <div style={styles.empty}>
                            No attempts yet.
                        </div>

                    ) : (

                        <div style={styles.tableWrapper}>

                            <table style={styles.table}>

                                <thead>
                                    <tr>
                                        <th style={styles.th}>
                                            Student
                                        </th>

                                        <th style={styles.th}>
                                            Quiz
                                        </th>

                                        <th style={styles.th}>
                                            Score
                                        </th>

                                        <th style={styles.th}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {recentAttempts.map(
                                        (attempt) => (

                                            <tr
                                                key={
                                                    attempt.id
                                                }
                                            >

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {attempt.user
                                                        ?.name ||
                                                        attempt.student
                                                            ?.name ||
                                                        attempt.userName ||
                                                        "Student"}
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {attempt.quiz
                                                        ?.title ||
                                                        attempt.quizTitle ||
                                                        "Quiz"}
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {Number(
                                                        attempt.percentage ??
                                                        attempt.score ??
                                                        0
                                                    ).toFixed(1)}
                                                    %
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >

                                                    <span
                                                        style={{
                                                            ...styles.status,
                                                            ...(attempt.status ===
                                                            "PASSED"
                                                                ? styles.passed
                                                                : styles.failed)
                                                        }}
                                                    >
                                                        {
                                                            attempt.status
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </section>


            {/* TOP STUDENTS */}

            <section style={styles.section}>

                <h2 style={styles.sectionTitle}>
                    Top Students
                </h2>

                <div style={styles.tableCard}>

                    {topStudents.length === 0 ? (

                        <div style={styles.empty}>
                            No student performance data yet.
                        </div>

                    ) : (

                        <div style={styles.tableWrapper}>

                            <table style={styles.table}>

                                <thead>

                                    <tr>

                                        <th style={styles.th}>
                                            Student
                                        </th>

                                        <th style={styles.th}>
                                            Email
                                        </th>

                                        <th style={styles.th}>
                                            Attempts
                                        </th>

                                        <th style={styles.th}>
                                            Average
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {topStudents.map(
                                        (student, index) => (

                                            <tr
    key={student.id}
    style={{
        borderTop: "1px solid #e5eaf0",

        background:
            Number(student.id) === Number(user?.id)
                ? "#eef5ff"
                : "transparent",

        boxShadow:
            Number(student.id) === Number(user?.id)
                ? "inset 4px 0 0 #2864e8"
                : "none"
    }}
>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    <strong
    style={{
        color:
            Number(student.id) === Number(user?.id)
                ? "#2864e8"
                : "#123d6b"
    }}
>
    {student.name}

    {Number(student.id) === Number(user?.id) && (
        <span
            style={{
                display: "inline-block",
                marginLeft: "10px",
                padding: "4px 10px",
                borderRadius: "12px",
                background: "#2864e8",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
                verticalAlign: "middle"
            }}
        >
            You
        </span>
    )}
</strong>
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {student.email}
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {
                                                        student.attempts
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        color: "#2864e8",
                                                        fontWeight:
                                                            "700"
                                                    }}
                                                >
                                                    {Number(
                                                        student.averageScore ??
                                                        student.average ??
                                                        0
                                                    ).toFixed(1)}
                                                    %
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </section>

        </div>
    );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    title,
    value,
    valueColor
}) {
    return (
        <div style={styles.statCard}>

            <div style={styles.statTitle}>
                {title}
            </div>

            <div
                style={{
                    ...styles.statValue,
                    color: valueColor || "#000"
                }}
            >
                {value}
            </div>

        </div>
    );
}


/* =========================================================
   STYLES
========================================================= */

const styles = {

    page: {
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "35px"
    },

    loading: {
        padding: "50px",
        textAlign: "center",
        fontSize: "20px",
        color: "#123d6b"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
    },

    title: {
        margin: 0,
        fontSize: "34px",
        color: "#123d6b"
    },

    subtitle: {
        marginTop: "8px",
        color: "#66809c",
        fontSize: "16px"
    },

    refreshButton: {
        border: "none",
        background: "#2864e8",
        color: "white",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },

    error: {
        background: "#ffe5e5",
        color: "#c00000",
        padding: "18px",
        borderRadius: "10px",
        marginBottom: "20px"
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "20px",
        marginBottom: "40px"
    },

    statCard: {
        background: "white",
        padding: "28px",
        borderRadius: "14px",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)"
    },

    statTitle: {
        color: "#66809c",
        fontSize: "16px",
        marginBottom: "14px"
    },

    statValue: {
        fontSize: "36px",
        fontWeight: "700"
    },

    section: {
        marginBottom: "35px"
    },

    sectionTitle: {
        color: "#123d6b",
        fontSize: "22px",
        marginBottom: "15px"
    },

    tableCard: {
        background: "white",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)"
    },

    tableWrapper: {
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    },

    th: {
        textAlign: "left",
        padding: "17px 20px",
        background: "#f3f6fa",
        color: "#123d6b",
        fontSize: "15px",
        borderBottom:
            "1px solid #e2e8f0"
    },

    td: {
        padding: "18px 20px",
        color: "#34495e",
        borderBottom:
            "1px solid #e8edf3"
    },

    empty: {
        padding: "45px",
        textAlign: "center",
        color: "#66809c"
    },

    status: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },

    passed: {
        background: "#dcfce7",
        color: "#15803d"
    },

    failed: {
        background: "#fee2e2",
        color: "#dc2626"
    }

};