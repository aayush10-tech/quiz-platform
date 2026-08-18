import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Quizzes() {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [duration, setDuration] = useState("");
    const [sort, setSort] = useState("recent");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Quiz Platform - Quizzes";

        loadQuizzes();
        loadCategories();
    }, []);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/quizzes", {
                params: {
                    page: 1,
                    limit: 1000,
                    status: "PUBLISHED"
                }
            });

            const data = response.data?.data;

            if (Array.isArray(data)) {
                setQuizzes(data);
            } else if (Array.isArray(data?.quizzes)) {
                setQuizzes(data.quizzes);
            } else {
                setQuizzes([]);
            }

        } catch (err) {
            console.error(
                "Student Quiz Listing Error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to load quizzes."
            );

            setQuizzes([]);

        } finally {
            setLoading(false);
        }
    };


    const loadCategories = async () => {
        try {
            const response = await api.get("/categories", {
                params: {
                    page: 1,
                    limit: 1000
                }
            });

            const data = response.data?.data;

            if (Array.isArray(data)) {
                setCategories(data);
            } else if (Array.isArray(data?.categories)) {
                setCategories(data.categories);
            } else {
                setCategories([]);
            }

        } catch (err) {
            console.error(
                "Category Loading Error:",
                err.response?.data || err.message
            );

            setCategories([]);
        }
    };


    const filteredQuizzes = useMemo(() => {

        let result = [...quizzes];

        const searchValue =
            search.trim().toLowerCase();


        /* SEARCH */

        if (searchValue) {
            result = result.filter((quiz) => {

                const title =
                    quiz.title?.toLowerCase() || "";

                const categoryName =
                    quiz.category?.name?.toLowerCase() || "";

                const description =
                    quiz.description?.toLowerCase() || "";

                return (
                    title.includes(searchValue) ||
                    categoryName.includes(searchValue) ||
                    description.includes(searchValue)
                );
            });
        }


        /* CATEGORY */

        if (category) {
            result = result.filter(
                (quiz) =>
                    String(quiz.categoryId) ===
                        String(category) ||
                    String(quiz.category?.id) ===
                        String(category)
            );
        }


        /* DIFFICULTY */

        if (difficulty) {
            result = result.filter(
                (quiz) =>
                    quiz.difficulty === difficulty
            );
        }


        /* DURATION */

        if (duration) {

            result = result.filter((quiz) => {

                const minutes =
                    Number(quiz.duration || 0);

                switch (duration) {

                    case "SHORT":
                        return minutes <= 15;

                    case "MEDIUM":
                        return (
                            minutes > 15 &&
                            minutes <= 30
                        );

                    case "LONG":
                        return (
                            minutes > 30 &&
                            minutes <= 60
                        );

                    case "VERY_LONG":
                        return minutes > 60;

                    default:
                        return true;
                }
            });
        }


        /* SORT */

        result.sort((a, b) => {

            if (sort === "recent") {

                return (
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
                );
            }


            if (sort === "popular") {

                const aAttempts =
                    Number(
                        a._count?.attempts ||
                        a.attemptsCount ||
                        0
                    );

                const bAttempts =
                    Number(
                        b._count?.attempts ||
                        b.attemptsCount ||
                        0
                    );

                return bAttempts - aAttempts;
            }


            if (sort === "durationAsc") {

                return (
                    Number(a.duration || 0) -
                    Number(b.duration || 0)
                );
            }


            if (sort === "durationDesc") {

                return (
                    Number(b.duration || 0) -
                    Number(a.duration || 0)
                );
            }


            return 0;
        });


        return result;

    }, [
        quizzes,
        search,
        category,
        difficulty,
        duration,
        sort
    ]);


    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setDifficulty("");
        setDuration("");
        setSort("recent");
    };


    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f4f7fb",
                padding: "35px"
            }}
        >

            <div
                style={{
                    maxWidth: "1300px",
                    margin: "0 auto"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        marginBottom: "30px",
                        flexWrap: "wrap"
                    }}
                >

                    <div>

                        <h1
                            style={{
                                margin: 0,
                                color: "#123d6b",
                                fontSize: "36px"
                            }}
                        >
                            Quiz Listing
                        </h1>

                        <p
                            style={{
                                marginTop: "8px",
                                color: "#66809c",
                                fontSize: "17px"
                            }}
                        >
                            Find a quiz and test your knowledge.
                        </p>

                    </div>


                    <div
                        style={{
                            background: "#e8edf5",
                            padding: "10px 16px",
                            borderRadius: "10px",
                            color: "#123d6b",
                            fontWeight: "600"
                        }}
                    >
                        {filteredQuizzes.length} quiz
                        {filteredQuizzes.length !== 1
                            ? "zes"
                            : ""}
                    </div>

                </div>


                {/* SEARCH + FILTERS */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "15px",
                        padding: "22px",
                        marginBottom: "30px",
                        boxShadow:
                            "0 5px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "minmax(250px, 2fr) repeat(4, 1fr)",
                            gap: "12px"
                        }}
                    >

                        {/* SEARCH */}

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="🔍 Search by quiz or category..."
                            style={styles.input}
                        />


                        {/* CATEGORY */}

                        <select
                            value={category}
                            onChange={(event) =>
                                setCategory(event.target.value)
                            }
                            style={styles.input}
                        >

                            <option value="">
                                All Categories
                            </option>

                            {categories.map(
                                (item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>

                                )
                            )}

                        </select>


                        {/* DIFFICULTY */}

                        <select
                            value={difficulty}
                            onChange={(event) =>
                                setDifficulty(
                                    event.target.value
                                )
                            }
                            style={styles.input}
                        >

                            <option value="">
                                All Difficulty
                            </option>

                            <option value="EASY">
                                Easy
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HARD">
                                Hard
                            </option>

                        </select>


                        {/* DURATION */}

                        <select
                            value={duration}
                            onChange={(event) =>
                                setDuration(
                                    event.target.value
                                )
                            }
                            style={styles.input}
                        >

                            <option value="">
                                Any Duration
                            </option>

                            <option value="SHORT">
                                Up to 15 min
                            </option>

                            <option value="MEDIUM">
                                16–30 min
                            </option>

                            <option value="LONG">
                                31–60 min
                            </option>

                            <option value="VERY_LONG">
                                60+ min
                            </option>

                        </select>


                        {/* SORT */}

                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(
                                    event.target.value
                                )
                            }
                            style={styles.input}
                        >

                            <option value="recent">
                                Recently Added
                            </option>

                            <option value="popular">
                                Popularity
                            </option>

                            <option value="durationAsc">
                                Shortest Duration
                            </option>

                            <option value="durationDesc">
                                Longest Duration
                            </option>

                        </select>

                    </div>


                    {/* CLEAR */}

                    {(search ||
                        category ||
                        difficulty ||
                        duration ||
                        sort !== "recent") && (

                        <button
                            type="button"
                            onClick={clearFilters}
                            style={styles.clearButton}
                        >
                            Clear Filters
                        </button>

                    )}

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        style={styles.error}
                    >
                        {error}
                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div
                        style={styles.emptyCard}
                    >
                        Loading available quizzes...
                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    filteredQuizzes.length === 0 && (

                        <div
                            style={styles.emptyCard}
                        >

                            <div
                                style={{
                                    fontSize: "45px",
                                    marginBottom: "10px"
                                }}
                            >
                                🔎
                            </div>

                            <h2
                                style={{
                                    color: "#123d6b",
                                    marginBottom: "8px"
                                }}
                            >
                                No quizzes found
                            </h2>

                            <p
                                style={{
                                    color: "#66809c"
                                }}
                            >
                                Try changing your search
                                or filters.
                            </p>

                            <button
                                onClick={clearFilters}
                                style={styles.primaryButton}
                            >
                                Clear Filters
                            </button>

                        </div>

                    )}


                {/* QUIZ LIST */}

                {!loading &&
                    filteredQuizzes.length > 0 && (

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(330px, 1fr))",
                                gap: "22px"
                            }}
                        >

                            {filteredQuizzes.map(
                                (quiz) => (

                                    <QuizCard
                                        key={quiz.id}
                                        quiz={quiz}
                                        onView={() =>
                                            navigate(
                                                `/student/quiz/${quiz.id}`
                                            )
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

            </div>

        </div>
    );
}


/* =========================================================
   QUIZ CARD
========================================================= */

function QuizCard({
    quiz,
    onView
}) {

    const difficultyClass =
        quiz.difficulty === "EASY"
            ? styles.easy
            : quiz.difficulty === "HARD"
                ? styles.hard
                : styles.medium;


    return (

        <div
            style={styles.card}
        >

            {/* TOP */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px"
                }}
            >

                <span
                    style={difficultyClass}
                >
                    {quiz.difficulty || "MEDIUM"}
                </span>

                <span
                    style={{
                        color: "#66809c",
                        fontSize: "14px"
                    }}
                >
                    ⏱ {quiz.duration || 0} min
                </span>

            </div>


            {/* TITLE */}

            <h2
                style={{
                    color: "#123d6b",
                    fontSize: "21px",
                    margin:
                        "18px 0 8px"
                }}
            >
                {quiz.title}
            </h2>


            {/* CATEGORY */}

            <div
                style={{
                    color: "#2864e8",
                    fontWeight: "600",
                    fontSize: "14px",
                    marginBottom: "10px"
                }}
            >
                {quiz.category?.name ||
                    "Uncategorized"}
            </div>


            {/* DESCRIPTION */}

            <p
                style={{
                    color: "#66809c",
                    lineHeight: 1.6,
                    minHeight: "52px",
                    marginBottom: "20px"
                }}
            >
                {quiz.description ||
                    "Test your knowledge."}
            </p>


            {/* INFO */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "1fr 1fr",
                    gap: "10px",
                    borderTop:
                        "1px solid #e5eaf0",
                    paddingTop: "16px"
                }}
            >

                <Info
                    label="Passing Score"
                    value={`${quiz.passingScore || 0}%`}
                />

                <Info
                    label="Max Attempts"
                    value={quiz.maxAttempts || 0}
                />

            </div>


            {/* POPULARITY */}

            <div
                style={{
                    marginTop: "14px",
                    color: "#66809c",
                    fontSize: "13px"
                }}
            >
                👥{" "}
                {quiz._count?.attempts || 0} attempts
            </div>


            {/* BUTTON */}

            <button
                onClick={onView}
                style={styles.viewButton}
            >
                View Quiz →
            </button>

        </div>
    );
}


function Info({
    label,
    value
}) {

    return (

        <div>

            <div
                style={{
                    color: "#66809c",
                    fontSize: "12px",
                    marginBottom: "4px"
                }}
            >
                {label}
            </div>

            <strong
                style={{
                    color: "#123d6b"
                }}
            >
                {value}
            </strong>

        </div>
    );
}


/* =========================================================
   STYLES
========================================================= */

const styles = {

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 13px",
        border:
            "1px solid #d7dfeb",
        borderRadius: "9px",
        outline: "none",
        background: "white",
        color: "#123d6b",
        fontSize: "14px"
    },

    card: {
        background: "white",
        borderRadius: "15px",
        padding: "23px",
        boxShadow:
            "0 5px 20px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column"
    },

    easy: {
        display: "inline-block",
        width: "fit-content",
        background: "#e8f7ed",
        color: "#16833d",
        padding: "6px 11px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },

    medium: {
        display: "inline-block",
        width: "fit-content",
        background: "#fff4db",
        color: "#a96b00",
        padding: "6px 11px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },

    hard: {
        display: "inline-block",
        width: "fit-content",
        background: "#ffe7e7",
        color: "#c62828",
        padding: "6px 11px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },

    primaryButton: {
        marginTop: "18px",
        border: "none",
        background: "#2864e8",
        color: "white",
        padding: "11px 18px",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer"
    },

    clearButton: {
        marginTop: "15px",
        border: "none",
        background: "#eef2f7",
        color: "#123d6b",
        padding: "9px 15px",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer"
    },

    viewButton: {
        width: "100%",
        marginTop: "20px",
        border: "none",
        borderRadius: "8px",
        padding: "13px",
        background: "#2864e8",
        color: "white",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },

    emptyCard: {
        background: "white",
        borderRadius: "15px",
        padding: "60px 30px",
        textAlign: "center",
        boxShadow:
            "0 5px 20px rgba(0,0,0,0.06)"
    },

    error: {
        background: "#ffe5e5",
        color: "#c00000",
        padding: "15px 18px",
        borderRadius: "10px",
        marginBottom: "20px"
    }

};