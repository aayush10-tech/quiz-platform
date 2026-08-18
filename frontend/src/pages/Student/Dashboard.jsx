import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getLeaderboard } from "../../services/leaderboard.service";
import api from "../../api/axios";
export default function Dashboard() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    const [loading, setLoading] = useState(true);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);

    const [error, setError] = useState("");
    const [leaderboardError, setLeaderboardError] = useState("");

    useEffect(() => {
        document.title = "Quiz Platform - Student";
        loadDashboard();
        loadQuizzes();
        loadLeaderboard();
    }, []);

    const loadDashboard = async () => {
        try {

            const response = await api.get("/dashboard/student");

            if (response.data?.success) {
                setDashboard(response.data.data);
            }

        } catch (error) {

            console.error(
                "Student Dashboard Error:",
                error.response?.data || error.message
            );

            setError("Unable to load dashboard.");

        } finally {
            setLoading(false);
        }
    };

    const loadQuizzes = async () => {
        try {

            const response = await api.get("/quizzes");

            const data = response.data?.data;

            if (Array.isArray(data)) {
                setQuizzes(data);
            } else if (Array.isArray(data?.quizzes)) {
                setQuizzes(data.quizzes);
            } else {
                setQuizzes([]);
            }

        } catch (error) {

            console.error(
                "Quiz Loading Error:",
                error.response?.data || error.message
            );

            setQuizzes([]);
        }
    };

    const loadLeaderboard = async () => {
        try {

            setLeaderboardLoading(true);

            const response = await getLeaderboard();

            console.log("LEADERBOARD RESPONSE:", response);

            if (response?.success) {

                const data = response.data;

                if (Array.isArray(data)) {
                    setLeaderboard(data);
                } else if (Array.isArray(data?.leaderboard)) {
                    setLeaderboard(data.leaderboard);
                } else {
                    setLeaderboard([]);
                }

            } else {
                setLeaderboard([]);
            }

        } catch (error) {

            console.error(
                "Leaderboard Error:",
                error.response?.data || error.message
            );

            setLeaderboardError("Unable to load leaderboard.");
            setLeaderboard([]);

        } finally {
            setLeaderboardLoading(false);
        }
    };

    if (loading) {
        return (
            
            <div
                style={{
                    padding: "50px",
                    textAlign: "center",
                    fontSize: "20px"
                }}
            >
                Loading Student Dashboard...
            </div>
        );
    }

    const overview = dashboard?.overview || {};

    return (
        
        <div
            style={{
                minHeight: "100vh",
                background: "#f4f7fb",
                padding: "40px"
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    maxWidth: "1300px",
                    margin: "0 auto"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "35px"
                    }}
                >

                    <div>
                        <h1
                            style={{
                                margin: 0,
                                color: "#123d6b",
                                fontSize: "38px"
                            }}
                        >
                            Student Dashboard
                        </h1>

                        <p
                            style={{
                                color: "#66809c",
                                fontSize: "18px"
                            }}
                        >
                            Choose a quiz and test your knowledge.
                        </p>
                    </div>

                    <button
                        style={{
                            border: "none",
                            background: "#e8edf5",
                            padding: "16px 24px",
                            borderRadius: "10px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                        onClick={() => {
                            window.scrollTo({
                                top: document.body.scrollHeight,
                                behavior: "smooth"
                            });
                        }}
                    >
                        🏆 Leaderboard
                    </button>

                </div>


                {/* ERROR */}

                {error && (
                    <div
                        style={{
                            background: "#ffe5e5",
                            color: "#d00000",
                            padding: "15px",
                            borderRadius: "10px",
                            marginBottom: "20px"
                        }}
                    >
                        {error}
                    </div>
                )}


                {/* STAT CARDS */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        marginBottom: "40px"
                    }}
                >

                    <StatCard
                        title="Available Quizzes"
                        value={quizzes.length}
                    />

                    <StatCard
                        title="Attempts"
                        value={overview.totalAttempts || 0}
                    />

                    <StatCard
                        title="Passed"
                        value={overview.passed || 0}
                    />

                    <StatCard
                        title="Average Score"
                        value={`${overview.averageScore || 0}%`}
                    />

                </div>


                {/* AVAILABLE QUIZZES */}

                <h2
    id="quizzes"
    style={{
        color: "#123d6b",
        marginBottom: "20px",
        scrollMarginTop: "100px"
    }}
>
    Available Quizzes
</h2>

                {quizzes.length === 0 ? (

                    <div
                        style={{
                            background: "white",
                            padding: "40px",
                            borderRadius: "15px",
                            textAlign: "center",
                            marginBottom: "50px"
                        }}
                    >
                        No quizzes available.
                    </div>

                ) : (

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                            marginBottom: "50px"
                        }}
                    >

                        {quizzes
                            .filter(
                                quiz =>
                                    !quiz.status ||
                                    quiz.status === "PUBLISHED"
                            )
                            .map((quiz) => (

                                <div
                                    key={quiz.id}
                                    style={{
                                        background: "white",
                                        borderRadius: "15px",
                                        padding: "25px",
                                        boxShadow:
                                            "0 5px 20px rgba(0,0,0,0.08)"
                                    }}
                                >

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems: "flex-start"
                                        }}
                                    >

                                        <div>

                                            <span
                                                style={{
                                                    background: "#e7ebff",
                                                    color: "#243ccf",
                                                    padding: "7px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {quiz.difficulty || "MEDIUM"}
                                            </span>

                                            <h2
                                                style={{
                                                    color: "#123d6b",
                                                    margin:
                                                        "15px 0 8px"
                                                }}
                                            >
                                                {quiz.title}
                                            </h2>

                                            <p
                                                style={{
                                                    color: "#66809c",
                                                    fontSize: "16px"
                                                }}
                                            >
                                                {quiz.description ||
                                                    "Test your knowledge."}
                                            </p>

                                        </div>

                                        <div
                                            style={{
                                                color: "#66809c"
                                            }}
                                        >
                                            ⏱ {quiz.duration || 0} min
                                        </div>

                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            marginTop: "30px",
                                            marginBottom: "20px",
                                            color: "#66809c"
                                        }}
                                    >
                                        <span>
                                            Pass:{" "}
                                            {quiz.passingScore || 0}%
                                        </span>

                                        <span>
                                            Max Attempts:{" "}
                                            {quiz.maxAttempts || 0}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() =>
                                            window.location.href =
                                                `/student/quiz/${quiz.id}`
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "15px",
                                            border: "none",
                                            borderRadius: "8px",
                                            background: "#2864e8",
                                            color: "white",
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            cursor: "pointer"
                                        }}
                                    >
                                        View Quiz →
                                    </button>

                                </div>

                            ))}

                    </div>

                )}


                {/* LEADERBOARD */}

                <div
                    id="leaderboard"
                    style={{
                        marginTop: "30px",
                        marginBottom: "50px"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    color: "#123d6b",
                                    margin: 0
                                }}
                            >
                                🏆 Student Leaderboard
                            </h2>

                            <p
                                style={{
                                    color: "#66809c"
                                }}
                            >
                                Students ranked by average quiz score.
                            </p>

                        </div>

                        <button
                            onClick={loadLeaderboard}
                            style={{
                                border: "none",
                                background: "#2864e8",
                                color: "white",
                                padding: "10px 18px",
                                borderRadius: "8px",
                                cursor: "pointer"
                            }}
                        >
                            Refresh
                        </button>

                    </div>


                    <div
                        style={{
                            background: "white",
                            borderRadius: "15px",
                            overflow: "hidden",
                            boxShadow:
                                "0 5px 20px rgba(0,0,0,0.08)"
                        }}
                    >

                        {leaderboardLoading ? (

                            <div
                                style={{
                                    padding: "50px",
                                    textAlign: "center",
                                    color: "#66809c"
                                }}
                            >
                                Loading leaderboard...
                            </div>

                        ) : leaderboardError ? (

                            <div
                                style={{
                                    padding: "50px",
                                    textAlign: "center",
                                    color: "#d00000"
                                }}
                            >
                                {leaderboardError}
                            </div>

                        ) : leaderboard.length === 0 ? (

                            <div
                                style={{
                                    padding: "50px",
                                    textAlign: "center",
                                    color: "#66809c"
                                }}
                            >
                                No leaderboard data available yet.
                            </div>

                        ) : (

                            <div
                                style={{
                                    overflowX: "auto"
                                }}
                            >

                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        minWidth: "750px"
                                    }}
                                >

                                    <thead>

                                        <tr
                                            style={{
                                                background: "#f3f6fa",
                                                textAlign: "left"
                                            }}
                                        >

                                            <th style={thStyle}>
                                                Rank
                                            </th>

                                            <th style={thStyle}>
                                                Student
                                            </th>

                                            <th style={thStyle}>
                                                Attempts
                                            </th>

                                            <th style={thStyle}>
                                                Passed
                                            </th>

                                            <th style={thStyle}>
                                                Failed
                                            </th>

                                            <th style={thStyle}>
                                                Average Score
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

    {leaderboard.map((student) => {

        const isCurrentStudent =
            Boolean(user?.email) &&
            Boolean(student?.email) &&
            user.email.toLowerCase() ===
                student.email.toLowerCase();

        return (

            <tr
                key={student.id}
                style={{
                    borderTop:
                        "1px solid #e5eaf0",

                    background:
                        isCurrentStudent
                            ? "#eaf2ff"
                            : "white",

                    boxShadow:
                        isCurrentStudent
                            ? "inset 5px 0 0 #2864e8"
                            : "none"
                }}
            >

                {/* RANK */}

                <td
                    style={{
                        ...tdStyle,
                        fontWeight: "700",
                        fontSize: "18px",

                        color:
                            isCurrentStudent
                                ? "#2864e8"
                                : undefined
                    }}
                >

                    {student.rank === 1
                        ? "🥇"
                        : student.rank === 2
                        ? "🥈"
                        : student.rank === 3
                        ? "🥉"
                        : `#${student.rank}`}

                </td>


                {/* STUDENT */}

                <td style={tdStyle}>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >

                        <strong
                            style={{
                                color: "#123d6b",
                                fontSize:
                                    isCurrentStudent
                                        ? "16px"
                                        : "inherit"
                            }}
                        >
                            {student.name}
                        </strong>


                        {isCurrentStudent && (

                            <span
                                style={{
                                    background:
                                        "#2864e8",
                                    color: "white",
                                    padding:
                                        "4px 9px",
                                    borderRadius:
                                        "20px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    whiteSpace:
                                        "nowrap"
                                }}
                            >
                                YOU
                            </span>

                        )}

                    </div>


                    <div
                        style={{
                            fontSize: "13px",
                            color: "#66809c",
                            marginTop: "4px"
                        }}
                    >
                        {student.email}
                    </div>

                </td>


                {/* ATTEMPTS */}

                <td style={tdStyle}>
                    {student.attempts}
                </td>


                {/* PASSED */}

                <td
                    style={{
                        ...tdStyle,
                        color: "#08a045",
                        fontWeight: "600"
                    }}
                >
                    {student.passed}
                </td>


                {/* FAILED */}

                <td
                    style={{
                        ...tdStyle,
                        color: "#e00000",
                        fontWeight: "600"
                    }}
                >
                    {student.failed}
                </td>


                {/* AVERAGE SCORE */}

                <td
                    style={{
                        ...tdStyle,
                        fontWeight: "700",
                        color: "#2864e8"
                    }}
                >
                    {student.averageScore}%
                </td>

            </tr>

        );

    })}

</tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>


                {/* RECENT ATTEMPTS */}

                <h2
                    style={{
                        color: "#123d6b",
                        marginBottom: "20px"
                    }}
                >
                    Recent Attempts
                </h2>

                <div
                    style={{
                        background: "white",
                        borderRadius: "15px",
                        overflow: "hidden",
                        boxShadow:
                            "0 5px 20px rgba(0,0,0,0.08)"
                    }}
                >

                    {dashboard?.recentAttempts?.length ? (

                        dashboard.recentAttempts.map(
                            (attempt) => (

                                <div
                                    key={attempt.id}
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems: "center",
                                        padding: "20px 25px",
                                        borderBottom:
                                            "1px solid #e5eaf0"
                                    }}
                                >

                                    <div>

                                        <strong>
                                            {attempt.quiz?.title ||
                                                "Quiz"}
                                        </strong>

                                        <div
                                            style={{
                                                color: "#66809c",
                                                marginTop: "5px"
                                            }}
                                        >
                                            {attempt.startedAt
                                                ? new Date(
                                                      attempt.startedAt
                                                  ).toLocaleDateString()
                                                : ""}
                                        </div>

                                    </div>

                                    <div
                                        style={{
                                            fontWeight: "700"
                                        }}
                                    >
                                        {attempt.percentage || 0}%
                                    </div>

                                </div>

                            )
                        )

                    ) : (

                        <div
                            style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#66809c"
                            }}
                        >
                            No attempts yet.
                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


function StatCard({ title, value }) {

    return (
        <div
            style={{
                background: "white",
                borderRadius: "15px",
                padding: "28px",
                boxShadow:
                    "0 5px 20px rgba(0,0,0,0.06)"
            }}
        >

            <div
                style={{
                    color: "#66809c",
                    marginBottom: "15px",
                    fontSize: "16px"
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color: "#123d6b",
                    fontSize: "36px",
                    fontWeight: "700"
                }}
            >
                {value}
            </div>

        </div>
    );
}


const thStyle = {
    padding: "18px 20px",
    color: "#123d6b",
    fontSize: "15px"
};

const tdStyle = {
    padding: "18px 20px",
    color: "#34495e"
};