import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Students() {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    const [selectedStudent, setSelectedStudent] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);


    /* ============================= */
    /* LOAD STUDENTS                 */
    /* ============================= */

    const loadStudents = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/users/students",
                {
                    params: {
                        page,
                        limit: 10,
                        search,
                        status
                    }
                }
            );

            const result = response.data;

            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Failed to load students"
                );

            }

            setStudents(
                result.data?.students || []
            );

            setPagination({
                total: result.data?.total || 0,
                totalPages:
                    result.data?.totalPages || 1
            });

        } catch (err) {

            console.error(
                "STUDENTS ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load students"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadStudents();

    }, [page, status]);


    /* ============================= */
    /* SEARCH                        */
    /* ============================= */

    const handleSearch = (event) => {

        event.preventDefault();

        setPage(1);

        loadStudents();

    };


    /* ============================= */
    /* CLEAR FILTERS                 */
    /* ============================= */

    const clearFilters = () => {

        setSearch("");
        setStatus("");
        setPage(1);

        setTimeout(() => {

            loadStudents();

        }, 0);

    };


    /* ============================= */
    /* VIEW STUDENT                  */
    /* ============================= */

    const viewStudent = async (id) => {

        try {

            setDetailsLoading(true);

            const response = await api.get(
                `/users/students/${id}`
            );

            if (!response.data.success) {

                throw new Error(
                    response.data.message
                );

            }

            setSelectedStudent(
                response.data.data
            );

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Unable to load student"
            );

        } finally {

            setDetailsLoading(false);

        }

    };


    /* ============================= */
    /* TOGGLE STATUS                 */
    /* ============================= */

    const toggleStatus = async (student) => {

        const newStatus =
            student.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const action =
            newStatus === "ACTIVE"
                ? "activate"
                : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${student.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.patch(
                `/users/students/${student.id}/status`,
                {
                    status: newStatus
                }
            );

            loadStudents();

            if (
                selectedStudent &&
                selectedStudent.id === student.id
            ) {

                setSelectedStudent({
                    ...selectedStudent,
                    status: newStatus
                });

            }

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Unable to update student status"
            );

        }

    };


    /* ============================= */
    /* DELETE STUDENT                */
    /* ============================= */

    const deleteStudent = async (student) => {

        const confirmed = window.confirm(
            `Delete ${student.name}? This will also permanently delete their quiz attempts.`
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/users/students/${student.id}`
            );

            if (
                selectedStudent &&
                selectedStudent.id === student.id
            ) {

                setSelectedStudent(null);

            }

            loadStudents();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Unable to delete student"
            );

        }

    };


    return (

        <div style={styles.page}>

            {/* HEADER */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Student Management
                    </h1>

                    <p style={styles.subtitle}>
                        Manage registered students,
                        their status and quiz performance.
                    </p>

                </div>

            </div>


            {/* STATISTICS */}

            <div style={styles.statsGrid}>

                <StatCard
                    title="Total Students"
                    value={pagination.total}
                />

                <StatCard
                    title="Active"
                    value={
                        students.filter(
                            student =>
                                student.status === "ACTIVE"
                        ).length
                    }
                />

                <StatCard
                    title="Inactive"
                    value={
                        students.filter(
                            student =>
                                student.status === "INACTIVE"
                        ).length
                    }
                />

            </div>


            {/* FILTERS */}

            <div style={styles.card}>

                <form
                    onSubmit={handleSearch}
                    style={styles.filters}
                >

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search student by name or email..."
                        style={styles.input}
                    />

                    <select
                        value={status}
                        onChange={(e) => {

                            setStatus(e.target.value);
                            setPage(1);

                        }}
                        style={styles.select}
                    >

                        <option value="">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </select>

                    <button
                        type="submit"
                        style={styles.primaryButton}
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        onClick={clearFilters}
                        style={styles.secondaryButton}
                    >
                        Clear
                    </button>

                </form>

            </div>


            {/* ERROR */}

            {error && (

                <div style={styles.error}>
                    {error}
                </div>

            )}


            {/* STUDENTS */}

            <div style={styles.card}>

                <div style={styles.tableHeader}>

                    <h2 style={styles.sectionTitle}>
                        Students
                    </h2>

                    <span style={styles.count}>
                        {pagination.total} student
                        {pagination.total !== 1
                            ? "s"
                            : ""}
                    </span>

                </div>


                {loading ? (

                    <div style={styles.empty}>
                        Loading students...
                    </div>

                ) : students.length === 0 ? (

                    <div style={styles.empty}>
                        No students found.
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
                                        Avg. Score
                                    </th>

                                    <th style={styles.th}>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {students.map(student => (

                                    <tr key={student.id}>

                                        <td style={styles.td}>

                                            <strong>
                                                {student.name}
                                            </strong>

                                        </td>

                                        <td style={styles.td}>
                                            {student.email}
                                        </td>

                                        <td style={styles.td}>

                                            <span
                                                style={{
                                                    ...styles.badge,
                                                    ...(student.status === "ACTIVE"
                                                        ? styles.active
                                                        : styles.inactive)
                                                }}
                                            >
                                                {student.status}
                                            </span>

                                        </td>

                                        <td style={styles.td}>
                                            {student.attempts}
                                        </td>

                                        <td
                                            style={{
                                                ...styles.td,
                                                color: "#16a34a",
                                                fontWeight: 600
                                            }}
                                        >
                                            {student.passed}
                                        </td>

                                        <td
                                            style={{
                                                ...styles.td,
                                                color: "#dc2626",
                                                fontWeight: 600
                                            }}
                                        >
                                            {student.failed}
                                        </td>

                                        <td style={styles.td}>
                                            {student.averageScore}%
                                        </td>

                                        <td style={styles.td}>

                                            <div style={styles.actions}>

                                                <button
                                                    onClick={() =>
                                                        viewStudent(
                                                            student.id
                                                        )
                                                    }
                                                    style={
                                                        styles.viewButton
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            student
                                                        )
                                                    }
                                                    style={
                                                        student.status ===
                                                        "ACTIVE"
                                                            ? styles.warningButton
                                                            : styles.successButton
                                                    }
                                                >
                                                    {student.status ===
                                                    "ACTIVE"
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteStudent(
                                                            student
                                                        )
                                                    }
                                                    style={
                                                        styles.deleteButton
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* PAGINATION */}

                {!loading &&
                    students.length > 0 && (

                        <div style={styles.pagination}>

                            <button
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage(page - 1)
                                }
                                style={{
                                    ...styles.pageButton,
                                    ...(page <= 1
                                        ? styles.disabledButton
                                        : {})
                                }}
                            >
                                Previous
                            </button>

                            <span style={styles.pageText}>
                                Page {page} of{" "}
                                {pagination.totalPages}
                            </span>

                            <button
                                disabled={
                                    page >=
                                    pagination.totalPages
                                }
                                onClick={() =>
                                    setPage(page + 1)
                                }
                                style={{
                                    ...styles.pageButton,
                                    ...(page >=
                                    pagination.totalPages
                                        ? styles.disabledButton
                                        : {})
                                }}
                            >
                                Next
                            </button>

                        </div>

                    )}

            </div>


            {/* STUDENT DETAILS MODAL */}

            {selectedStudent && (

                <div style={styles.overlay}>

                    <div style={styles.modal}>

                        <div style={styles.modalHeader}>

                            <div style={{ minWidth: 0 }}>

                                <h2 style={styles.modalTitle}>
                                    {selectedStudent.name}
                                </h2>

                                <p style={styles.modalEmail}>
                                    {selectedStudent.email}
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedStudent(null)
                                }
                                style={styles.closeButton}
                            >
                                ×
                            </button>

                        </div>


                        {detailsLoading ? (

                            <div style={styles.empty}>
                                Loading...
                            </div>

                        ) : (

                            <>

                                <div style={styles.detailGrid}>

                                    <DetailCard
                                        title="Status"
                                        value={
                                            selectedStudent.status
                                        }
                                    />

                                    <DetailCard
                                        title="Total Attempts"
                                        value={
                                            selectedStudent
                                                .statistics
                                                .totalAttempts
                                        }
                                    />

                                    <DetailCard
                                        title="Passed"
                                        value={
                                            selectedStudent
                                                .statistics
                                                .passed
                                        }
                                    />

                                    <DetailCard
                                        title="Failed"
                                        value={
                                            selectedStudent
                                                .statistics
                                                .failed
                                        }
                                    />

                                    <DetailCard
                                        title="Average Score"
                                        value={`${selectedStudent.statistics.averageScore}%`}
                                    />

                                </div>


                                <h3 style={styles.attemptTitle}>
                                    Quiz Attempts
                                </h3>


                                {selectedStudent.attempts
                                    .length === 0 ? (

                                    <div style={styles.empty}>
                                        No quiz attempts yet.
                                    </div>

                                ) : (

                                    <div
                                        style={
                                            styles.attemptList
                                        }
                                    >

                                        {selectedStudent.attempts.map(
                                            attempt => (

                                                <div
                                                    key={
                                                        attempt.id
                                                    }
                                                    style={
                                                        styles.attemptItem
                                                    }
                                                >

                                                    <div
                                                        style={{
                                                            minWidth: 0
                                                        }}
                                                    >

                                                        <strong>
                                                            {
                                                                attempt
                                                                    .quiz
                                                                    ?.title
                                                            }
                                                        </strong>

                                                        <div
                                                            style={
                                                                styles.smallText
                                                            }
                                                        >
                                                            {
                                                                attempt
                                                                    .quiz
                                                                    ?.difficulty
                                                            }
                                                            {" • "}
                                                            {
                                                                attempt
                                                                    .quiz
                                                                    ?.duration
                                                            }
                                                            {" mins"}
                                                        </div>

                                                    </div>


                                                    <div
                                                        style={
                                                            styles.attemptRight
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                attempt.percentage
                                                            }%
                                                        </strong>

                                                        <span
                                                            style={{
                                                                ...styles.badge,
                                                                ...(attempt.status ===
                                                                "PASSED"
                                                                    ? styles.active
                                                                    : styles.inactive)
                                                            }}
                                                        >
                                                            {
                                                                attempt.status
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}


/* ================================= */
/* STAT CARD                         */
/* ================================= */

function StatCard({ title, value }) {

    return (

        <div style={styles.statCard}>

            <div style={styles.statTitle}>
                {title}
            </div>

            <div style={styles.statValue}>
                {value}
            </div>

        </div>

    );

}


/* ================================= */
/* DETAIL CARD                       */
/* ================================= */

function DetailCard({ title, value }) {

    return (

        <div style={styles.detailCard}>

            <div style={styles.detailTitle}>
                {title}
            </div>

            <div style={styles.detailValue}>
                {value}
            </div>

        </div>

    );

}


/* ================================= */
/* RESPONSIVE STYLES                 */
/* ================================= */

const styles = {

    page: {
        padding: "clamp(16px, 3vw, 36px)",
        background: "#f4f7fb",
        minHeight: "100vh",
        boxSizing: "border-box"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
    },

    title: {
        margin: 0,
        fontSize: "clamp(25px, 4vw, 34px)",
        color: "#17345f"
    },

    subtitle: {
        marginTop: "8px",
        color: "#64748b",
        fontSize: "clamp(13px, 2vw, 16px)",
        lineHeight: 1.5
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        gap: "16px",
        marginBottom: "24px"
    },

    statCard: {
        background: "#fff",
        borderRadius: "14px",
        padding: "22px",
        boxShadow:
            "0 2px 8px rgba(15, 23, 42, 0.08)"
    },

    statTitle: {
        color: "#64748b",
        fontSize: "14px",
        marginBottom: "10px"
    },

    statValue: {
        fontSize: "clamp(26px, 5vw, 32px)",
        fontWeight: 700,
        color: "#17345f"
    },

    card: {
        background: "#fff",
        borderRadius: "14px",
        padding: "clamp(15px, 3vw, 22px)",
        marginBottom: "24px",
        boxShadow:
            "0 2px 8px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box"
    },

    filters: {
        display: "grid",
        gridTemplateColumns:
            "minmax(0, 2fr) minmax(150px, 1fr) auto auto",
        gap: "12px",
        alignItems: "center"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 15px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "15px",
        outline: "none"
    },

    select: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 15px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "15px",
        background: "#fff"
    },

    primaryButton: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "13px 20px",
        borderRadius: "8px",
        fontSize: "15px",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    secondaryButton: {
        border: "none",
        background: "#e2e8f0",
        color: "#1e293b",
        padding: "13px 20px",
        borderRadius: "8px",
        fontSize: "15px",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    tableHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px",
        flexWrap: "wrap"
    },

    sectionTitle: {
        margin: 0,
        color: "#17345f",
        fontSize: "21px"
    },

    count: {
        color: "#64748b",
        fontSize: "14px"
    },

    tableWrapper: {
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "1000px"
    },

    th: {
        textAlign: "left",
        padding: "14px 12px",
        background: "#f8fafc",
        borderBottom: "1px solid #cbd5e1",
        color: "#334155",
        fontSize: "14px",
        whiteSpace: "nowrap"
    },

    td: {
        padding: "15px 12px",
        borderBottom: "1px solid #e2e8f0",
        color: "#334155",
        fontSize: "14px"
    },

    badge: {
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },

    active: {
        background: "#dcfce7",
        color: "#15803d"
    },

    inactive: {
        background: "#fee2e2",
        color: "#b91c1c"
    },

    actions: {
        display: "flex",
        gap: "7px",
        flexWrap: "wrap"
    },

    viewButton: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "8px 11px",
        borderRadius: "6px",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    warningButton: {
        border: "none",
        background: "#f59e0b",
        color: "#fff",
        padding: "8px 11px",
        borderRadius: "6px",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    successButton: {
        border: "none",
        background: "#16a34a",
        color: "#fff",
        padding: "8px 11px",
        borderRadius: "6px",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    deleteButton: {
        border: "none",
        background: "#dc2626",
        color: "#fff",
        padding: "8px 11px",
        borderRadius: "6px",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    empty: {
        padding: "45px 20px",
        textAlign: "center",
        color: "#64748b"
    },

    error: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "14px 18px",
        borderRadius: "9px",
        marginBottom: "20px"
    },

    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "15px",
        paddingTop: "22px",
        flexWrap: "wrap"
    },

    pageButton: {
        border: "none",
        background: "#e2e8f0",
        color: "#1e293b",
        padding: "9px 16px",
        borderRadius: "7px",
        cursor: "pointer"
    },

    disabledButton: {
        opacity: 0.45,
        cursor: "not-allowed"
    },

    pageText: {
        color: "#475569",
        fontSize: "14px"
    },

    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "15px",
        zIndex: 1000,
        boxSizing: "border-box"
    },

    modal: {
        width: "min(900px, 100%)",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#fff",
        borderRadius: "16px",
        padding: "clamp(18px, 4vw, 28px)",
        boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.25)",
        boxSizing: "border-box"
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        marginBottom: "25px"
    },

    modalTitle: {
        margin: 0,
        color: "#17345f",
        fontSize: "clamp(20px, 4vw, 26px)",
        wordBreak: "break-word"
    },

    modalEmail: {
        marginTop: "6px",
        color: "#64748b",
        fontSize: "14px",
        wordBreak: "break-word"
    },

    closeButton: {
        border: "none",
        background: "#f1f5f9",
        width: "38px",
        height: "38px",
        minWidth: "38px",
        borderRadius: "50%",
        fontSize: "25px",
        cursor: "pointer"
    },

    detailGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
        gap: "12px",
        marginBottom: "28px"
    },

    detailCard: {
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "15px"
    },

    detailTitle: {
        color: "#64748b",
        fontSize: "12px",
        marginBottom: "7px"
    },

    detailValue: {
        color: "#17345f",
        fontSize: "19px",
        fontWeight: 700
    },

    attemptTitle: {
        color: "#17345f",
        marginBottom: "12px"
    },

    attemptList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },

    attemptItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        padding: "15px",
        border: "1px solid #e2e8f0",
        borderRadius: "9px",
        flexWrap: "wrap"
    },

    attemptRight: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
    },

    smallText: {
        color: "#64748b",
        fontSize: "13px",
        marginTop: "5px"
    }

};