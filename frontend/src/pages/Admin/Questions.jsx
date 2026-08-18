import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import useQuestions from "../../hooks/useQuestions";

const emptyForm = {
    questionText: "",
    explanation: "",
    marks: 1,
    questionOrder: 1,
    options: [
        {
            optionText: "",
            isCorrect: true
        },
        {
            optionText: "",
            isCorrect: false
        },
        {
            optionText: "",
            isCorrect: false
        },
        {
            optionText: "",
            isCorrect: false
        }
    ]
};

export default function Questions() {

    const {
        questions,
        loading,
        saving,
        error,
        loadQuestions,
        getQuestion,
        addQuestion,
        removeQuestion
    } = useQuestions();

    const [quizzes, setQuizzes] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);

    const [selectedQuiz, setSelectedQuiz] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState(emptyForm);

    const [search, setSearch] = useState("");

    const [message, setMessage] = useState("");

    const [details, setDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // --------------------------------------------------
    // LOAD QUIZZES
    // --------------------------------------------------

    const loadQuizzes = async () => {

        try {

            setQuizLoading(true);

            const response = await api.get("/quizzes");

            console.log("QUIZ RESPONSE:", response);

            const quizData = response?.data?.data?.quizzes;

            if (Array.isArray(quizData)) {

                setQuizzes(quizData);

                // Automatically select first quiz
                if (!selectedQuiz && quizData.length > 0) {
                    setSelectedQuiz(String(quizData[0].id));
                }

            } else {

                setQuizzes([]);

            }

        } catch (err) {

            console.error("QUIZ LOAD ERROR:", err);

            setQuizzes([]);

        } finally {

            setQuizLoading(false);

        }

    };

    // --------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------

    useEffect(() => {
        loadQuizzes();
    }, []);

    // --------------------------------------------------
    // LOAD QUESTIONS WHEN QUIZ CHANGES
    // --------------------------------------------------

    useEffect(() => {

        if (selectedQuiz) {

            loadQuestions(Number(selectedQuiz));

        } else {

            loadQuestions(null);

        }

    }, [selectedQuiz, loadQuestions]);

    // --------------------------------------------------
    // SET QUESTION ORDER
    // --------------------------------------------------

    useEffect(() => {

        if (questions.length > 0) {

            setForm((current) => ({
                ...current,
                questionOrder: questions.length + 1
            }));

        } else {

            setForm((current) => ({
                ...current,
                questionOrder: 1
            }));

        }

    }, [questions.length]);

    // --------------------------------------------------
    // FORM HANDLERS
    // --------------------------------------------------

    const handleTextChange = (event) => {

        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));

    };

    const handleOptionChange = (index, value) => {

        setForm((current) => {

            const options = [...current.options];

            options[index] = {
                ...options[index],
                optionText: value
            };

            return {
                ...current,
                options
            };

        });

    };

    const handleCorrectOption = (index) => {

        setForm((current) => ({

            ...current,

            options: current.options.map(
                (option, optionIndex) => ({
                    ...option,
                    isCorrect: optionIndex === index
                })
            )

        }));

    };

    // --------------------------------------------------
    // OPEN FORM
    // --------------------------------------------------

    const openForm = () => {

        if (!selectedQuiz) {

            setMessage("Please select a quiz first.");

            return;

        }

        setMessage("");

        setForm({
            ...emptyForm,
            questionOrder: questions.length + 1
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

    // --------------------------------------------------
    // CLOSE FORM
    // --------------------------------------------------

    const closeForm = () => {

        setShowForm(false);

        setForm({
            ...emptyForm,
            questionOrder: questions.length + 1
        });

    };

    // --------------------------------------------------
    // SUBMIT QUESTION
    // --------------------------------------------------

    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");

        if (!selectedQuiz) {

            setMessage("Please select a quiz.");

            return;

        }

        if (form.questionText.trim().length < 5) {

            setMessage(
                "Question must contain at least 5 characters."
            );

            return;

        }

        if (Number(form.marks) < 1) {

            setMessage("Marks must be at least 1.");

            return;

        }

        if (Number(form.questionOrder) < 1) {

            setMessage(
                "Question order must be at least 1."
            );

            return;

        }

        const hasEmptyOption = form.options.some(
            (option) =>
                !option.optionText.trim()
        );

        if (hasEmptyOption) {

            setMessage(
                "Please fill all 4 options."
            );

            return;

        }

        const correctCount = form.options.filter(
            (option) => option.isCorrect
        ).length;

        if (correctCount !== 1) {

            setMessage(
                "Please select exactly one correct answer."
            );

            return;

        }

        const payload = {

            questionText:
                form.questionText.trim(),

            explanation:
                form.explanation.trim(),

            marks:
                Number(form.marks),

            questionOrder:
                Number(form.questionOrder),

            quizId:
                Number(selectedQuiz),

            options:
                form.options.map((option) => ({
                    optionText:
                        option.optionText.trim(),

                    isCorrect:
                        option.isCorrect
                }))

        };

        console.log("SENDING QUESTION:", payload);

        const result = await addQuestion(payload);

        if (!result.success) {

            setMessage(
                result.message ||
                "Failed to create question."
            );

            return;

        }

        setMessage(
            "Question created successfully."
        );

        setShowForm(false);

        setForm({
            ...emptyForm,
            questionOrder: questions.length + 2
        });

        await loadQuestions(
            Number(selectedQuiz)
        );

    };

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    const handleDelete = async (question) => {

        const confirmed = window.confirm(
            `Delete this question?\n\n"${question.questionText}"`
        );

        if (!confirmed) {
            return;
        }

        const success = await removeQuestion(
            question.id
        );

        if (success) {

            setMessage(
                "Question deleted successfully."
            );

        }

    };

    // --------------------------------------------------
    // VIEW DETAILS
    // --------------------------------------------------

    const handleView = async (id) => {

        setDetailsLoading(true);
        setDetails(null);

        const question = await getQuestion(id);

        setDetails(question);

        setDetailsLoading(false);

    };

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    const filteredQuestions = useMemo(() => {

        const value =
            search.trim().toLowerCase();

        if (!value) {
            return questions;
        }

        return questions.filter(
            (question) =>
                question.questionText
                    ?.toLowerCase()
                    .includes(value)
        );

    }, [questions, search]);

    // --------------------------------------------------
    // SELECTED QUIZ
    // --------------------------------------------------

    const selectedQuizData = quizzes.find(
        (quiz) =>
            String(quiz.id) === String(selectedQuiz)
    );

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (

        <div
            style={{
                padding: "10px 0 40px"
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "25px",
                    flexWrap: "wrap"
                }}
            >

                <div>

                    <h1
                        style={{
                            fontSize: "32px",
                            fontWeight: "700",
                            color: "#172b4d",
                            margin: 0
                        }}
                    >
                        Question Management
                    </h1>

                    <p
                        style={{
                            marginTop: "7px",
                            color: "#64748b",
                            fontSize: "15px"
                        }}
                    >
                        Create, view and manage quiz questions.
                    </p>

                </div>

                <button
                    onClick={openForm}
                    style={primaryButton}
                >
                    + Add Question
                </button>

            </div>

            {/* MESSAGE */}

            {(message || error) && (

                <div
                    style={{
                        padding: "14px 18px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        background:
                            error
                                ? "#fff1f2"
                                : "#ecfdf5",
                        color:
                            error
                                ? "#be123c"
                                : "#047857",
                        border:
                            error
                                ? "1px solid #fecdd3"
                                : "1px solid #a7f3d0",
                        fontWeight: "500"
                    }}
                >
                    {error || message}
                </div>

            )}

            {/* QUIZ SELECTOR */}

            <div style={cardStyle}>

                <label
                    style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "9px",
                        color: "#334155"
                    }}
                >
                    Select Quiz
                </label>

                <select
                    value={selectedQuiz}
                    onChange={(event) => {
                        setSelectedQuiz(event.target.value);
                        setShowForm(false);
                        setSearch("");
                    }}
                    disabled={quizLoading}
                    style={inputStyle}
                >

                    <option value="">
                        {quizLoading
                            ? "Loading quizzes..."
                            : "Select a quiz"}
                    </option>

                    {quizzes.map((quiz) => (

                        <option
                            key={quiz.id}
                            value={quiz.id}
                        >
                            {quiz.title}
                        </option>

                    ))}

                </select>

                {selectedQuizData && (

                    <div
                        style={{
                            marginTop: "12px",
                            color: "#64748b",
                            fontSize: "14px"
                        }}
                    >
                        <strong>
                            Selected:
                        </strong>{" "}
                        {selectedQuizData.title}
                    </div>

                )}

            </div>

            {/* CREATE FORM */}

            {showForm && (

                <div
                    style={{
                        ...cardStyle,
                        marginTop: "20px"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "22px"
                        }}
                    >

                        <h2
                            style={{
                                margin: 0,
                                fontSize: "23px",
                                color: "#172b4d"
                            }}
                        >
                            Add Question
                        </h2>

                        <button
                            onClick={closeForm}
                            style={secondaryButton}
                            type="button"
                        >
                            Close
                        </button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* QUESTION */}

                        <label style={labelStyle}>
                            Question *
                        </label>

                        <textarea
                            name="questionText"
                            value={form.questionText}
                            onChange={handleTextChange}
                            placeholder="Enter question..."
                            rows="4"
                            style={{
                                ...inputStyle,
                                resize: "vertical"
                            }}
                        />

                        {/* OPTIONS */}

                        <div
                            style={{
                                marginTop: "22px"
                            }}
                        >

                            <label style={labelStyle}>
                                Options *
                            </label>

                            <p
                                style={{
                                    marginTop: "-4px",
                                    marginBottom: "14px",
                                    color: "#64748b",
                                    fontSize: "13px"
                                }}
                            >
                                Select the radio button beside
                                the correct answer.
                            </p>

                            {form.options.map(
                                (option, index) => (

                                    <div
                                        key={index}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            marginBottom: "12px"
                                        }}
                                    >

                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={
                                                option.isCorrect
                                            }
                                            onChange={() =>
                                                handleCorrectOption(
                                                    index
                                                )
                                            }
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                cursor: "pointer"
                                            }}
                                        />

                                        <input
                                            type="text"
                                            value={
                                                option.optionText
                                            }
                                            onChange={(event) =>
                                                handleOptionChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            placeholder={`Option ${index + 1}`}
                                            style={{
                                                ...inputStyle,
                                                flex: 1,
                                                margin: 0
                                            }}
                                        />

                                    </div>

                                )
                            )}

                        </div>

                        {/* MARKS / ORDER */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "18px",
                                marginTop: "20px"
                            }}
                        >

                            <div>

                                <label style={labelStyle}>
                                    Marks *
                                </label>

                                <input
                                    type="number"
                                    name="marks"
                                    min="1"
                                    value={form.marks}
                                    onChange={handleTextChange}
                                    style={inputStyle}
                                />

                            </div>

                            <div>

                                <label style={labelStyle}>
                                    Question Order *
                                </label>

                                <input
                                    type="number"
                                    name="questionOrder"
                                    min="1"
                                    value={
                                        form.questionOrder
                                    }
                                    onChange={handleTextChange}
                                    style={inputStyle}
                                />

                            </div>

                        </div>

                        {/* EXPLANATION */}

                        <div
                            style={{
                                marginTop: "20px"
                            }}
                        >

                            <label style={labelStyle}>
                                Explanation
                            </label>

                            <textarea
                                name="explanation"
                                value={
                                    form.explanation
                                }
                                onChange={handleTextChange}
                                placeholder="Optional explanation..."
                                rows="3"
                                style={{
                                    ...inputStyle,
                                    resize: "vertical"
                                }}
                            />

                        </div>

                        {/* ACTIONS */}

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "24px"
                            }}
                        >

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    ...primaryButton,
                                    opacity: saving
                                        ? 0.7
                                        : 1
                                }}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Question"}
                            </button>

                            <button
                                type="button"
                                onClick={closeForm}
                                style={secondaryButton}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            )}

            {/* QUESTIONS */}

            <div
                style={{
                    ...cardStyle,
                    marginTop: "20px",
                    padding: 0,
                    overflow: "hidden"
                }}
            >

                <div
                    style={{
                        padding: "20px",
                        borderBottom:
                            "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap"
                    }}
                >

                    <div>

                        <h2
                            style={{
                                margin: 0,
                                fontSize: "21px",
                                color: "#172b4d"
                            }}
                        >
                            Questions
                        </h2>

                        <span
                            style={{
                                color: "#64748b",
                                fontSize: "13px"
                            }}
                        >
                            {questions.length} question
                            {questions.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search question..."
                        style={{
                            ...inputStyle,
                            width: "280px",
                            margin: 0
                        }}
                    />

                </div>

                {!selectedQuiz ? (

                    <div style={emptyStyle}>
                        Select a quiz to view questions.
                    </div>

                ) : loading ? (

                    <div style={emptyStyle}>
                        Loading questions...
                    </div>

                ) : filteredQuestions.length === 0 ? (

                    <div style={emptyStyle}>

                        {search
                            ? "No questions match your search."
                            : "No questions found for this quiz."}

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
                                borderCollapse:
                                    "collapse",
                                minWidth: "750px"
                            }}
                        >

                            <thead>

                                <tr
                                    style={{
                                        background:
                                            "#f8fafc"
                                    }}
                                >

                                    <th
                                        style={thStyle}
                                    >
                                        #
                                    </th>

                                    <th
                                        style={thStyle}
                                    >
                                        Question
                                    </th>

                                    <th
                                        style={thStyle}
                                    >
                                        Marks
                                    </th>

                                    <th
                                        style={thStyle}
                                    >
                                        Options
                                    </th>

                                    <th
                                        style={thStyle}
                                    >
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredQuestions.map(
                                    (question, index) => (

                                        <tr
                                            key={
                                                question.id
                                            }
                                        >

                                            <td
                                                style={tdStyle}
                                            >
                                                {
                                                    question.questionOrder ||
                                                    index + 1
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    fontWeight:
                                                        "600",
                                                    maxWidth:
                                                        "500px"
                                                }}
                                            >
                                                {
                                                    question.questionText
                                                }
                                            </td>

                                            <td
                                                style={tdStyle}
                                            >
                                                {
                                                    question.marks
                                                }
                                            </td>

                                            <td
                                                style={tdStyle}
                                            >
                                                {Array.isArray(
                                                    question.options
                                                )
                                                    ? question
                                                        .options
                                                        .length
                                                    : 0}
                                            </td>

                                            <td
                                                style={tdStyle}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap:
                                                            "8px"
                                                    }}
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleView(
                                                                question.id
                                                            )
                                                        }
                                                        style={{
                                                            ...smallButton,
                                                            background:
                                                                "#2563eb"
                                                        }}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                question
                                                            )
                                                        }
                                                        style={{
                                                            ...smallButton,
                                                            background:
                                                                "#ef4444"
                                                        }}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* DETAILS MODAL */}

            {(details || detailsLoading) && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(15, 23, 42, 0.55)",
                        display: "flex",
                        justifyContent:
                            "center",
                        alignItems: "center",
                        padding: "20px",
                        zIndex: 9999
                    }}
                    onClick={() =>
                        !detailsLoading &&
                        setDetails(null)
                    }
                >

                    <div
                        style={{
                            background: "#fff",
                            width: "100%",
                            maxWidth: "700px",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            borderRadius: "12px",
                            padding: "25px",
                            boxShadow:
                                "0 20px 50px rgba(0,0,0,.25)"
                        }}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {detailsLoading ? (

                            <div style={emptyStyle}>
                                Loading question...
                            </div>

                        ) : (

                            <>
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        gap: "15px",
                                        alignItems:
                                            "center",
                                        marginBottom:
                                            "20px"
                                    }}
                                >

                                    <h2
                                        style={{
                                            margin: 0,
                                            color:
                                                "#172b4d"
                                        }}
                                    >
                                        Question Details
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDetails(
                                                null
                                            )
                                        }
                                        style={
                                            secondaryButton
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                                <div
                                    style={{
                                        padding:
                                            "16px",
                                        background:
                                            "#f8fafc",
                                        borderRadius:
                                            "8px",
                                        marginBottom:
                                            "20px"
                                    }}
                                >

                                    <h3
                                        style={{
                                            marginTop: 0
                                        }}
                                    >
                                        {
                                            details.questionText
                                        }
                                    </h3>

                                    <p>
                                        <strong>
                                            Marks:
                                        </strong>{" "}
                                        {
                                            details.marks
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Order:
                                        </strong>{" "}
                                        {
                                            details.questionOrder
                                        }
                                    </p>

                                </div>

                                <h3>
                                    Options
                                </h3>

                                <div>

                                    {details.options?.map(
                                        (
                                            option,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    option.id ||
                                                    index
                                                }
                                                style={{
                                                    padding:
                                                        "13px 15px",
                                                    marginBottom:
                                                        "10px",
                                                    borderRadius:
                                                        "7px",
                                                    border:
                                                        option.isCorrect
                                                            ? "2px solid #10b981"
                                                            : "1px solid #e2e8f0",
                                                    background:
                                                        option.isCorrect
                                                            ? "#ecfdf5"
                                                            : "#fff"
                                                }}
                                            >

                                                <strong>
                                                    {String.fromCharCode(
                                                        65 +
                                                            index
                                                    )}
                                                    .
                                                </strong>{" "}

                                                {
                                                    option.optionText
                                                }

                                                {option.isCorrect && (

                                                    <span
                                                        style={{
                                                            marginLeft:
                                                                "10px",
                                                            color:
                                                                "#059669",
                                                            fontWeight:
                                                                "700"
                                                        }}
                                                    >
                                                        ✓ Correct
                                                    </span>

                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                                {details.explanation && (

                                    <div
                                        style={{
                                            marginTop:
                                                "20px",
                                            padding:
                                                "15px",
                                            background:
                                                "#eff6ff",
                                            borderRadius:
                                                "8px"
                                        }}
                                    >

                                        <strong>
                                            Explanation
                                        </strong>

                                        <p
                                            style={{
                                                marginBottom: 0
                                            }}
                                        >
                                            {
                                                details.explanation
                                            }
                                        </p>

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

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
        "0 2px 8px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0"
};

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "7px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff"
};

const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#334155"
};

const primaryButton = {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "7px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer"
};

const secondaryButton = {
    border: "none",
    background: "#e2e8f0",
    color: "#334155",
    padding: "11px 18px",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer"
};

const smallButton = {
    border: "none",
    color: "#ffffff",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
};

const thStyle = {
    textAlign: "left",
    padding: "15px",
    color: "#334155",
    fontSize: "14px",
    borderBottom:
        "1px solid #e2e8f0"
};

const tdStyle = {
    padding: "15px",
    borderBottom:
        "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle"
};

const emptyStyle = {
    padding: "45px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "15px"
};