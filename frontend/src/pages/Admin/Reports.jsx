import { useEffect, useMemo, useState } from "react";

import {
    getAdminReports
} from "../../services/reports.service";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";


export default function Reports() {

    const [reports, setReports] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [quizFilter, setQuizFilter] =
        useState("ALL");


    // ========================================================
    // LOAD REPORTS
    // ========================================================

    const loadReports = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getAdminReports();

            console.log(
                "ADMIN REPORTS:",
                response
            );

            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Failed to load reports"
                );

            }

            setReports(response.data);

        } catch (err) {

            console.error(
                "Reports Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load reports"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadReports();

    }, []);


    // ========================================================
    // FILTER RECENT ATTEMPTS
    // ========================================================

    const filteredAttempts = useMemo(() => {

        if (!reports?.recentAttempts) {
            return [];
        }


        return reports.recentAttempts.filter(
            (attempt) => {

                const studentName =
                    attempt.student?.name ||
                    "";

                const studentEmail =
                    attempt.student?.email ||
                    "";

                const quizTitle =
                    attempt.quiz?.title ||
                    "";


                const searchText =
                    search.toLowerCase().trim();


                const matchesSearch =
                    searchText === "" ||
                    studentName
                        .toLowerCase()
                        .includes(searchText) ||
                    studentEmail
                        .toLowerCase()
                        .includes(searchText) ||
                    quizTitle
                        .toLowerCase()
                        .includes(searchText);


                const matchesStatus =
                    statusFilter === "ALL" ||
                    attempt.status === statusFilter;


                const matchesQuiz =
                    quizFilter === "ALL" ||
                    String(
                        attempt.quiz?.id
                    ) === quizFilter;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesQuiz
                );

            }
        );

    }, [
        reports,
        search,
        statusFilter,
        quizFilter
    ]);


    // ========================================================
    // CSV EXPORT
    // ========================================================

    const exportCSV = () => {

        if (!filteredAttempts.length) {

            alert(
                "There are no report records to export."
            );

            return;

        }


        const headers = [

            "Student",
            "Email",
            "Quiz",
            "Score",
            "Percentage",
            "Correct",
            "Incorrect",
            "Unanswered",
            "Status",
            "Started At"

        ];


        const rows =
            filteredAttempts.map(
                (attempt) => [

                    attempt.student?.name || "",

                    attempt.student?.email || "",

                    attempt.quiz?.title || "",

                    attempt.score ?? 0,

                    `${attempt.percentage ?? 0}%`,

                    attempt.correctAnswers ?? 0,

                    attempt.incorrectAnswers ?? 0,

                    attempt.unanswered ?? 0,

                    attempt.status || "",

                    new Date(
                        attempt.startedAt
                    ).toLocaleString()

                ]
            );


        const csv = [

            headers,

            ...rows

        ]
            .map(
                (row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(
                                    value ?? ""
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "quiz-report.csv";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div style={styles.page}>

                <h1 style={styles.heading}>
                    Reports & Analytics
                </h1>

                <div style={styles.card}>
                    Loading reports...
                </div>

            </div>

        );

    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (

            <div style={styles.page}>

                <h1 style={styles.heading}>
                    Reports & Analytics
                </h1>

                <div style={styles.error}>
                    {error}
                </div>

                <button
                    onClick={loadReports}
                    style={styles.primaryButton}
                >
                    Try Again
                </button>

            </div>

        );

    }


    if (!reports) {
        return null;
    }


    const overview =
        reports.overview || {};


    const analytics =
        reports.analytics || {};


    const attemptsOverTime =
        analytics.attemptsOverTime || [];


    const registrationsOverTime =
        analytics.registrationsOverTime || [];


    const passFailRatio =
        analytics.passFailRatio || [];


    const popularQuizzes =
        analytics.popularQuizzes || [];


    const categoryPerformance =
        analytics.categoryPerformance || [];


    const topStudents =
        analytics.topStudents || [];


    return (

        <div style={styles.page}>

            {/* =================================================
                HEADER
            ================================================= */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.heading}>
                        Reports & Analytics
                    </h1>

                    <p style={styles.subtitle}>
                        Analyze quiz performance,
                        student results and platform activity.
                    </p>

                </div>


                <div style={styles.headerButtons}>

                    <button
                        onClick={loadReports}
                        style={styles.secondaryButton}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        onClick={exportCSV}
                        style={styles.primaryButton}
                    >
                        Export CSV
                    </button>

                </div>

            </div>


            {/* =================================================
                OVERVIEW
            ================================================= */}

            <div style={styles.statsGrid}>

                <StatCard
                    title="Students"
                    value={
                        overview.totalStudents ?? 0
                    }
                />

                <StatCard
                    title="Quizzes"
                    value={
                        overview.totalQuizzes ?? 0
                    }
                />

                <StatCard
                    title="Questions"
                    value={
                        overview.totalQuestions ?? 0
                    }
                />

                <StatCard
                    title="Attempts"
                    value={
                        overview.totalAttempts ?? 0
                    }
                />

                <StatCard
                    title="Passed"
                    value={
                        overview.passedAttempts ?? 0
                    }
                    valueStyle={styles.green}
                />

                <StatCard
                    title="Failed"
                    value={
                        overview.failedAttempts ?? 0
                    }
                    valueStyle={styles.red}
                />

                <StatCard
                    title="Average Score"
                    value={`${overview.averageScore ?? 0}%`}
                />

                <StatCard
                    title="Pass Rate"
                    value={`${overview.passRate ?? 0}%`}
                    valueStyle={styles.blue}
                />

            </div>


            {/* =================================================
                ATTEMPTS OVER TIME
            ================================================= */}

            <section style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Attempts Over Time
                </h2>

                {attemptsOverTime.length === 0 ? (

                    <EmptyState text="No attempt data available yet." />

                ) : (

                    <div style={styles.chartContainer}>

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <LineChart
                                data={attemptsOverTime}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="date"
                                />

                                <YAxis
                                    allowDecimals={false}
                                />

                                <Tooltip />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="attempts"
                                    name="Attempts"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot
                                />

                                <Line
                                    type="monotone"
                                    dataKey="passed"
                                    name="Passed"
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="failed"
                                    name="Failed"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                )}

            </section>


            {/* =================================================
                REGISTRATIONS + PASS FAIL
            ================================================= */}

            <div style={styles.twoColumn}>

                <section style={styles.card}>

                    <h2 style={styles.sectionTitle}>
                        Student Registrations
                    </h2>

                    {registrationsOverTime.length === 0 ? (

                        <EmptyState text="No registration data available yet." />

                    ) : (

                        <div style={styles.chartContainer}>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={registrationsOverTime}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="date"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="registrations"
                                        name="Registrations"
                                        fill="#7c3aed"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </section>


                <section style={styles.card}>

                    <h2 style={styles.sectionTitle}>
                        Pass / Fail Ratio
                    </h2>

                    {(
                        passedValue(
                            passFailRatio
                        ) +
                        failedValue(
                            passFailRatio
                        )
                    ) === 0 ? (

                        <EmptyState text="No completed attempts available yet." />

                    ) : (

                        <div style={styles.chartContainer}>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <PieChart>

                                    <Pie
                                        data={passFailRatio}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        label
                                    >

                                        {passFailRatio.map(
                                            (entry, index) => (

                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.name ===
                                                        "Passed"
                                                            ? "#16a34a"
                                                            : "#dc2626"
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </section>

            </div>


            {/* =================================================
                POPULAR QUIZZES
            ================================================= */}

            <section style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Most Popular Quizzes
                </h2>

                {popularQuizzes.length === 0 ? (

                    <EmptyState text="No quiz attempt data available yet." />

                ) : (

                    <div style={styles.chartContainer}>

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >

                            <BarChart
                                data={popularQuizzes}
                                layout="vertical"
                                margin={{
                                    left: 30,
                                    right: 30
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    type="number"
                                    allowDecimals={false}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="title"
                                    width={180}
                                />

                                <Tooltip />

                                <Legend />

                                <Bar
                                    dataKey="attempts"
                                    name="Attempts"
                                    fill="#2563eb"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                )}

            </section>


            {/* =================================================
                CATEGORY PERFORMANCE
            ================================================= */}

            <section style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Category Performance
                </h2>

                {categoryPerformance.length === 0 ? (

                    <EmptyState text="No category performance data available yet." />

                ) : (

                    <div style={styles.tableWrapper}>

                        <table style={styles.table}>

                            <thead>

                                <tr>

                                    <th style={styles.th}>
                                        Category
                                    </th>

                                    <th style={styles.th}>
                                        Quizzes
                                    </th>

                                    <th style={styles.th}>
                                        Attempts
                                    </th>

                                    <th style={styles.th}>
                                        Passed
                                    </th>

                                    <th style={styles.th}>
                                        Failed
                                    </th>

                                    <th style={styles.th}>
                                        Average Score
                                    </th>

                                    <th style={styles.th}>
                                        Pass Rate
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {categoryPerformance.map(
                                    (category) => (

                                        <tr
                                            key={
                                                category.category
                                            }
                                        >

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        category.category
                                                    }
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    category.quizzes
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    category.attempts
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.green
                                                }}
                                            >
                                                {
                                                    category.passed
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.red
                                                }}
                                            >
                                                {
                                                    category.failed
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    category.averageScore
                                                }%
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.blue
                                                }}
                                            >
                                                {
                                                    category.passRate
                                                }%
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =================================================
                TOP STUDENTS
            ================================================= */}

            <section style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Top Students
                </h2>

                {topStudents.length === 0 ? (

                    <EmptyState text="No student performance data available yet." />

                ) : (

                    <div style={styles.tableWrapper}>

                        <table style={styles.table}>

                            <thead>

                                <tr>

                                    <th style={styles.th}>
                                        Rank
                                    </th>

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
                                        Passed
                                    </th>

                                    <th style={styles.th}>
                                        Average Score
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {topStudents.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student.id
                                            }
                                        >

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    #{student.rank}
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    student.name
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    student.email
                                                }
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
                                                    ...styles.green
                                                }}
                                            >
                                                {
                                                    student.passed
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.blue
                                                }}
                                            >
                                                {
                                                    student.averageScore
                                                }%
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =================================================
                QUIZ PERFORMANCE
            ================================================= */}

            <section style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Quiz Performance
                </h2>

                <div style={styles.tableWrapper}>

                    <table style={styles.table}>

                        <thead>

                            <tr>

                                <th style={styles.th}>
                                    Quiz
                                </th>

                                <th style={styles.th}>
                                    Category
                                </th>

                                <th style={styles.th}>
                                    Difficulty
                                </th>

                                <th style={styles.th}>
                                    Questions
                                </th>

                                <th style={styles.th}>
                                    Attempts
                                </th>

                                <th style={styles.th}>
                                    Passed
                                </th>

                                <th style={styles.th}>
                                    Failed
                                </th>

                                <th style={styles.th}>
                                    Average
                                </th>

                                <th style={styles.th}>
                                    Pass Rate
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {reports.quizReports?.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        style={styles.empty}
                                    >
                                        No quiz reports found.
                                    </td>

                                </tr>

                            ) : (

                                reports.quizReports?.map(
                                    (quiz) => (

                                        <tr
                                            key={
                                                quiz.id
                                            }
                                        >

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        quiz.title
                                                    }
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    quiz.category
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    quiz.difficulty
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    quiz.questions
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    quiz.attempts
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.green
                                                }}
                                            >
                                                {
                                                    quiz.passed
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.red
                                                }}
                                            >
                                                {
                                                    quiz.failed
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    quiz.averageScore
                                                }%
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    quiz.passRate
                                                }%
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                STUDENT PERFORMANCE
            ================================================= */}

            <section style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Student Performance
                </h2>

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
                                    Status
                                </th>

                                <th style={styles.th}>
                                    Attempts
                                </th>

                                <th style={styles.th}>
                                    Passed
                                </th>

                                <th style={styles.th}>
                                    Failed
                                </th>

                                <th style={styles.th}>
                                    Average Score
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {reports.studentReports?.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        style={styles.empty}
                                    >
                                        No students found.
                                    </td>

                                </tr>

                            ) : (

                                reports.studentReports?.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student.id
                                            }
                                        >

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        student.name
                                                    }
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    student.email
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >

                                                <span
                                                    style={
                                                        student.status ===
                                                        "ACTIVE"
                                                            ? styles.activeBadge
                                                            : styles.inactiveBadge
                                                    }
                                                >
                                                    {
                                                        student.status
                                                    }
                                                </span>

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
                                                    ...styles.green
                                                }}
                                            >
                                                {
                                                    student.passed
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.red
                                                }}
                                            >
                                                {
                                                    student.failed
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    student.averageScore
                                                }%
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                RECENT ATTEMPTS
            ================================================= */}

            <section style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Recent Attempts
                </h2>

                <p style={styles.smallText}>
                    Search and filter student attempts.
                </p>


                {/* Filters */}

                <div style={styles.filters}>

                    <input
                        type="text"
                        placeholder="Search student, email or quiz..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        style={styles.input}
                    />


                    <select
                        value={quizFilter}
                        onChange={(e) =>
                            setQuizFilter(
                                e.target.value
                            )
                        }
                        style={styles.select}
                    >

                        <option value="ALL">
                            All Quizzes
                        </option>

                        {(
                            reports.quizReports ||
                            []
                        ).map(
                            (quiz) => (

                                <option
                                    key={
                                        quiz.id
                                    }
                                    value={
                                        quiz.id
                                    }
                                >
                                    {
                                        quiz.title
                                    }
                                </option>

                            )
                        )}

                    </select>


                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        style={styles.select}
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        <option value="PASSED">
                            Passed
                        </option>

                        <option value="FAILED">
                            Failed
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                    </select>


                    <button
                        onClick={() => {

                            setSearch("");

                            setStatusFilter(
                                "ALL"
                            );

                            setQuizFilter(
                                "ALL"
                            );

                        }}
                        style={styles.clearButton}
                    >
                        Clear
                    </button>

                </div>


                {/* Attempts table */}

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
                                    Correct
                                </th>

                                <th style={styles.th}>
                                    Incorrect
                                </th>

                                <th style={styles.th}>
                                    Unanswered
                                </th>

                                <th style={styles.th}>
                                    Status
                                </th>

                                <th style={styles.th}>
                                    Date
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredAttempts.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        style={styles.empty}
                                    >
                                        No attempts found.
                                    </td>

                                </tr>

                            ) : (

                                filteredAttempts.map(
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

                                                <strong>
                                                    {
                                                        attempt
                                                            .student
                                                            ?.name
                                                    }
                                                </strong>

                                                <div
                                                    style={
                                                        styles.email
                                                    }
                                                >
                                                    {
                                                        attempt
                                                            .student
                                                            ?.email
                                                    }
                                                </div>

                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    attempt
                                                        .quiz
                                                        ?.title
                                                }
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    attempt
                                                        .percentage
                                                }%
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    attempt
                                                        .correctAnswers
                                                }
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    attempt
                                                        .incorrectAnswers
                                                }
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    attempt
                                                        .unanswered
                                                }
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >

                                                <span
                                                    style={
                                                        getStatusStyle(
                                                            attempt.status
                                                        )
                                                    }
                                                >
                                                    {
                                                        attempt.status
                                                    }
                                                </span>

                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {new Date(
                                                    attempt.startedAt
                                                ).toLocaleString()}
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>

    );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    title,
    value,
    valueStyle
}) {

    return (

        <div style={styles.statCard}>

            <div style={styles.statTitle}>
                {title}
            </div>

            <div
                style={{
                    ...styles.statValue,
                    ...valueStyle
                }}
            >
                {value}
            </div>

        </div>

    );

}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ text }) {

    return (

        <div style={styles.empty}>
            {text}
        </div>

    );

}


// ============================================================
// PASS / FAIL HELPERS
// ============================================================

function passedValue(data) {

    const item =
        data.find(
            (entry) =>
                entry.name === "Passed"
        );

    return item?.value || 0;

}


function failedValue(data) {

    const item =
        data.find(
            (entry) =>
                entry.name === "Failed"
        );

    return item?.value || 0;

}


// ============================================================
// STATUS STYLE
// ============================================================

function getStatusStyle(status) {

    if (status === "PASSED") {

        return styles.passedBadge;

    }


    if (status === "FAILED") {

        return styles.failedBadge;

    }


    return styles.progressBadge;

}


// ============================================================
// STYLES
// ============================================================

const styles = {

    page: {
        padding: "40px",
        background: "#f4f7fb",
        minHeight: "100vh"
    },


    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        gap: "20px",
        flexWrap: "wrap"
    },


    headerButtons: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap"
    },


    heading: {
        margin: 0,
        color: "#102a56",
        fontSize: "36px"
    },


    subtitle: {
        color: "#61728f",
        fontSize: "16px",
        marginTop: "8px"
    },


    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
    },


    statCard: {
        background: "#ffffff",
        borderRadius: "14px",
        padding: "25px",
        boxShadow:
            "0 3px 12px rgba(0,0,0,0.08)"
    },


    statTitle: {
        color: "#60708b",
        fontSize: "15px",
        marginBottom: "10px"
    },


    statValue: {
        color: "#102a56",
        fontSize: "32px",
        fontWeight: "700"
    },


    twoColumn: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "30px"
    },


    card: {
        background: "#ffffff",
        borderRadius: "14px",
        padding: "22px",
        marginBottom: "30px",
        boxShadow:
            "0 3px 12px rgba(0,0,0,0.08)",
        overflow: "hidden"
    },


    sectionTitle: {
        margin: "0 0 18px 0",
        color: "#102a56",
        fontSize: "22px"
    },


    smallText: {
        color: "#71809a",
        marginTop: "-10px",
        marginBottom: "18px"
    },


    chartContainer: {
        width: "100%",
        minHeight: "280px"
    },


    tableWrapper: {
        width: "100%",
        overflowX: "auto"
    },


    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "850px"
    },


    th: {
        background: "#f3f6fa",
        color: "#172b4d",
        padding: "15px",
        textAlign: "left",
        borderBottom:
            "1px solid #dce3ed",
        whiteSpace: "nowrap"
    },


    td: {
        padding: "15px",
        borderBottom:
            "1px solid #e6ebf2",
        color: "#243b5a"
    },


    empty: {
        textAlign: "center",
        padding: "45px",
        color: "#71809a"
    },


    filters: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "20px"
    },


    input: {
        flex: "1 1 300px",
        padding: "13px 15px",
        border:
            "1px solid #cdd7e5",
        borderRadius: "8px",
        fontSize: "15px",
        outline: "none"
    },


    select: {
        padding: "13px 15px",
        border:
            "1px solid #cdd7e5",
        borderRadius: "8px",
        fontSize: "15px",
        background: "#ffffff",
        minWidth: "160px"
    },


    primaryButton: {
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        padding: "13px 20px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },


    secondaryButton: {
        background: "#ffffff",
        color: "#2563eb",
        border:
            "1px solid #2563eb",
        borderRadius: "8px",
        padding: "13px 20px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },


    clearButton: {
        background: "#e6ebf2",
        color: "#243b5a",
        border: "none",
        borderRadius: "8px",
        padding: "13px 20px",
        fontSize: "15px",
        cursor: "pointer"
    },


    green: {
        color: "#0aa34f"
    },


    red: {
        color: "#e11d2e"
    },


    blue: {
        color: "#2563eb"
    },


    activeBadge: {
        display: "inline-block",
        background: "#dcfce7",
        color: "#15803d",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },


    inactiveBadge: {
        display: "inline-block",
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },


    passedBadge: {
        display: "inline-block",
        background: "#dcfce7",
        color: "#15803d",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },


    failedBadge: {
        display: "inline-block",
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },


    progressBadge: {
        display: "inline-block",
        background: "#fef3c7",
        color: "#a16207",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700"
    },


    email: {
        fontSize: "12px",
        color: "#71809a",
        marginTop: "4px"
    },


    error: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "18px",
        borderRadius: "8px",
        marginBottom: "15px"
    }

};