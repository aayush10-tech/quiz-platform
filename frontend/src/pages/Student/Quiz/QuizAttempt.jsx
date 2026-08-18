import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getQuizById
} from "../../../services/quiz.service";

import {
    getQuestionsByQuiz
} from "../../../services/question.service";

import {
    submitAttempt
} from "../../../services/attempt.service";


export default function QuizAttempt() {

    const {
        quizId,
        attemptId
    } = useParams();

    const navigate = useNavigate();


    /* =========================================================
       STATE
    ========================================================= */

    const [quiz, setQuiz] = useState(null);

    const [questions, setQuestions] =
        useState([]);

    const [answers, setAnswers] =
        useState({});

    const [currentIndex, setCurrentIndex] =
        useState(0);

    const [timeLeft, setTimeLeft] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showSubmitModal, setShowSubmitModal] =
        useState(false);

    const [autoSubmitted, setAutoSubmitted] =
        useState(false);


    /*
     * Prevent multiple automatic/manual submissions.
     */
    const submissionStartedRef =
        useRef(false);


    /*
     * Store timer interval.
     */
    const timerRef =
        useRef(null);


    /* =========================================================
       STORAGE KEYS
    ========================================================= */

    const storageKey =
        `quiz_attempt_${attemptId}_started`;

    const answersStorageKey =
        `quiz_attempt_${attemptId}_answers`;

    const questionStorageKey =
        `quiz_attempt_${attemptId}_question`;


    /* =========================================================
       LOAD QUIZ + QUESTIONS
    ========================================================= */

    useEffect(() => {

        let cancelled = false;


        const loadQuiz = async () => {

            try {

                setLoading(true);
                setError("");


                const [
                    quizResponse,
                    questionResponse
                ] = await Promise.all([

                    getQuizById(quizId),

                    getQuestionsByQuiz(quizId)

                ]);


                if (!quizResponse?.success) {

                    throw new Error(
                        quizResponse?.message ||
                        "Failed to load quiz"
                    );

                }


                if (cancelled) {
                    return;
                }


                const loadedQuiz =
                    quizResponse.data;


                setQuiz(
                    loadedQuiz
                );


                const questionData =
                    Array.isArray(
                        questionResponse?.data
                    )
                        ? questionResponse.data
                        : questionResponse?.data?.questions ||
                          [];


                if (!questionData.length) {

                    setQuestions([]);

                    return;

                }


                setQuestions(
                    questionData
                );


                /* =================================================
                   RESTORE ANSWERS
                ================================================== */

                try {

                    const savedAnswers =
                        localStorage.getItem(
                            answersStorageKey
                        );

                    if (savedAnswers) {

                        const parsedAnswers =
                            JSON.parse(
                                savedAnswers
                            );

                        if (
                            parsedAnswers &&
                            typeof parsedAnswers ===
                                "object"
                        ) {

                            setAnswers(
                                parsedAnswers
                            );

                        }

                    }

                } catch (storageError) {

                    console.warn(
                        "Unable to restore saved answers:",
                        storageError
                    );

                }


                /* =================================================
                   RESTORE CURRENT QUESTION
                ================================================== */

                try {

                    const savedQuestion =
                        localStorage.getItem(
                            questionStorageKey
                        );

                    if (savedQuestion !== null) {

                        const savedIndex =
                            Number(
                                savedQuestion
                            );

                        if (
                            Number.isInteger(
                                savedIndex
                            ) &&
                            savedIndex >= 0 &&
                            savedIndex <
                                questionData.length
                        ) {

                            setCurrentIndex(
                                savedIndex
                            );

                        }

                    }

                } catch (storageError) {

                    console.warn(
                        "Unable to restore question position:",
                        storageError
                    );

                }


                /* =================================================
                   TIMER
                ================================================== */

                let startedAt =
                    localStorage.getItem(
                        storageKey
                    );


                if (!startedAt) {

                    startedAt =
                        String(
                            Date.now()
                        );

                    localStorage.setItem(
                        storageKey,
                        startedAt
                    );

                }


                const durationSeconds =
                    Number(
                        loadedQuiz?.duration || 0
                    ) * 60;


                const elapsedSeconds =
                    Math.floor(
                        (
                            Date.now() -
                            Number(startedAt)
                        ) / 1000
                    );


                const remaining =
                    Math.max(
                        0,
                        durationSeconds -
                        elapsedSeconds
                    );


                setTimeLeft(
                    remaining
                );


            } catch (err) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Quiz Attempt Load Error:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load quiz"
                );


            } finally {

                if (!cancelled) {

                    setLoading(
                        false
                    );

                }

            }

        };


        loadQuiz();


        return () => {

            cancelled = true;

        };

    }, [
        quizId,
        attemptId,
        answersStorageKey,
        questionStorageKey,
        storageKey
    ]);


    /* =========================================================
       SAVE ANSWERS LOCALLY
    ========================================================= */

    useEffect(() => {

        if (loading) {
            return;
        }


        try {

            localStorage.setItem(
                answersStorageKey,
                JSON.stringify(answers)
            );

        } catch (err) {

            console.warn(
                "Unable to save answers:",
                err
            );

        }

    }, [
        answers,
        answersStorageKey,
        loading
    ]);


    /* =========================================================
       SAVE CURRENT QUESTION
    ========================================================= */

    useEffect(() => {

        if (loading) {
            return;
        }


        try {

            localStorage.setItem(
                questionStorageKey,
                String(currentIndex)
            );

        } catch (err) {

            console.warn(
                "Unable to save question position:",
                err
            );

        }

    }, [
        currentIndex,
        questionStorageKey,
        loading
    ]);


    /* =========================================================
       FORMAT TIME
    ========================================================= */

    const formattedTime =
        useMemo(() => {

            if (timeLeft === null) {

                return "--:--";

            }


            const safeTime =
                Math.max(
                    0,
                    timeLeft
                );


            const minutes =
                Math.floor(
                    safeTime / 60
                );


            const seconds =
                safeTime % 60;


            return (
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`
            );

        }, [
            timeLeft
        ]);


    /* =========================================================
       TIMER WARNING
    ========================================================= */

    const timerDanger =
        timeLeft !== null &&
        timeLeft <= 60;


    const timerWarning =
        timeLeft !== null &&
        timeLeft <= 300 &&
        timeLeft > 60;


    /* =========================================================
       SUBMIT QUIZ
    ========================================================= */

    const handleSubmit = useCallback(
        async (automatic = false) => {

            /*
             * Prevent duplicate submissions.
             */
            if (
                submitting ||
                submissionStartedRef.current
            ) {

                return;

            }


            /*
             * Manual submission confirmation.
             */
            if (!automatic) {

                const unanswered =
                    questions.filter(
                        question =>
                            answers[question.id] ===
                                undefined ||
                            answers[question.id] ===
                                null
                    ).length;


                if (unanswered > 0) {

                    const confirmed =
                        window.confirm(
                            `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Are you sure you want to submit?`
                        );


                    if (!confirmed) {

                        return;

                    }

                }

            }


            try {

                submissionStartedRef.current =
                    true;

                setSubmitting(
                    true
                );

                setError("");


                /*
                 * Stop timer immediately.
                 */
                if (timerRef.current) {

                    clearInterval(
                        timerRef.current
                    );

                    timerRef.current =
                        null;

                }


                /*
                 * Convert answer object to API format.
                 */
                const formattedAnswers =
                    Object.entries(
                        answers
                    ).map(
                        ([
                            questionId,
                            optionId
                        ]) => ({

                            questionId:
                                Number(
                                    questionId
                                ),

                            optionId:
                                Number(
                                    optionId
                                )

                        })
                    );


                const response =
                    await submitAttempt(
                        Number(attemptId),
                        formattedAnswers
                    );


                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        "Failed to submit quiz"
                    );

                }


                /*
                 * Clear temporary attempt data.
                 */
                localStorage.removeItem(
                    storageKey
                );

                localStorage.removeItem(
                    answersStorageKey
                );

                localStorage.removeItem(
                    questionStorageKey
                );


                /*
                 * Navigate to result.
                 */
                navigate(
                    `/student/result/${attemptId}`,
                    {
                        replace: true
                    }
                );


            } catch (err) {

                console.error(
                    "Submit Quiz Error:",
                    err
                );


                submissionStartedRef.current =
                    false;


                setSubmitting(
                    false
                );


                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to submit quiz"
                );

            }

        },
        [
            submitting,
            questions,
            answers,
            attemptId,
            navigate,
            storageKey,
            answersStorageKey,
            questionStorageKey
        ]
    );


    /* =========================================================
       TIMER
    ========================================================= */

    useEffect(() => {

        if (
            loading ||
            timeLeft === null ||
            submitting
        ) {

            return;

        }


        /*
         * Clear any previous timer.
         */
        if (timerRef.current) {

            clearInterval(
                timerRef.current
            );

        }


        /*
         * Time already expired.
         */
        if (timeLeft <= 0) {

            if (!autoSubmitted) {

                setAutoSubmitted(
                    true
                );

                handleSubmit(
                    true
                );

            }

            return;

        }


        timerRef.current =
            setInterval(() => {

                setTimeLeft(
                    previous => {

                        if (
                            previous === null
                        ) {

                            return previous;

                        }


                        if (
                            previous <= 1
                        ) {

                            return 0;

                        }


                        return previous - 1;

                    }
                );

            }, 1000);


        return () => {

            if (timerRef.current) {

                clearInterval(
                    timerRef.current
                );

                timerRef.current =
                    null;

            }

        };

    }, [
        loading,
        submitting,
        timeLeft,
        autoSubmitted,
        handleSubmit
    ]);


    /* =========================================================
       HANDLE TIMER REACHING ZERO
    ========================================================= */

    useEffect(() => {

        if (
            timeLeft !== 0 ||
            loading ||
            submitting ||
            autoSubmitted
        ) {

            return;

        }


        setAutoSubmitted(
            true
        );


        handleSubmit(
            true
        );

    }, [
        timeLeft,
        loading,
        submitting,
        autoSubmitted,
        handleSubmit
    ]);


    /* =========================================================
       SELECT ANSWER
    ========================================================= */

    const selectAnswer = (
        questionId,
        optionId
    ) => {

        if (submitting) {
            return;
        }


        setAnswers(
            previous => ({

                ...previous,

                [questionId]:
                    Number(optionId)

            })
        );

    };


    /* =========================================================
       NAVIGATE QUESTION
    ========================================================= */

    const goToQuestion = (
        index
    ) => {

        if (submitting) {
            return;
        }


        if (
            index < 0 ||
            index >= questions.length
        ) {

            return;

        }


        setCurrentIndex(
            index
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    /* =========================================================
       NEXT
    ========================================================= */

    const goNext = () => {

        if (
            currentIndex <
            questions.length - 1
        ) {

            goToQuestion(
                currentIndex + 1
            );

        }

    };


    /* =========================================================
       PREVIOUS
    ========================================================= */

    const goPrevious = () => {

        if (
            currentIndex > 0
        ) {

            goToQuestion(
                currentIndex - 1
            );

        }

    };


    /* =========================================================
       BEFORE UNLOAD
    ========================================================= */

    useEffect(() => {

        const preventAccidentalClose =
            (event) => {

                if (
                    !submitting &&
                    questions.length > 0 &&
                    timeLeft !== null &&
                    timeLeft > 0
                ) {

                    event.preventDefault();

                    event.returnValue = "";

                }

            };


        window.addEventListener(
            "beforeunload",
            preventAccidentalClose
        );


        return () => {

            window.removeEventListener(
                "beforeunload",
                preventAccidentalClose
            );

        };

    }, [
        submitting,
        questions.length,
        timeLeft
    ]);


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div style={styles.center}>

                <div style={styles.loadingCard}>

                    <div style={styles.loadingIcon}>
                        ⏳
                    </div>

                    <div style={styles.loadingTitle}>
                        Loading Quiz
                    </div>

                    <div style={styles.loadingText}>
                        Please wait...
                    </div>

                </div>

            </div>

        );

    }


    /* =========================================================
       ERROR
    ========================================================= */

    if (
        error &&
        questions.length === 0
    ) {

        return (

            <div style={styles.center}>

                <div style={styles.errorCard}>

                    <div style={styles.errorIcon}>
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Quiz
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/quizzes"
                            )
                        }
                        style={styles.button}
                    >
                        ← Back to Quizzes
                    </button>

                </div>

            </div>

        );

    }


    /* =========================================================
       NO QUESTIONS
    ========================================================= */

    if (
        questions.length === 0
    ) {

        return (

            <div style={styles.center}>

                <div style={styles.loadingCard}>

                    <div style={styles.errorIcon}>
                        📝
                    </div>

                    <h2>
                        No Questions Available
                    </h2>

                    <p>
                        This quiz does not have
                        any questions yet.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/quizzes"
                            )
                        }
                        style={styles.button}
                    >
                        ← Back to Quizzes
                    </button>

                </div>

            </div>

        );

    }


    /* =========================================================
       CURRENT QUESTION
    ========================================================= */

    const currentQuestion =
        questions[currentIndex];


    const selectedOption =
        answers[
            currentQuestion.id
        ];


    const answeredCount =
        questions.filter(
            question =>
                answers[
                    question.id
                ] !== undefined &&
                answers[
                    question.id
                ] !== null
        ).length;


    const unansweredCount =
        questions.length -
        answeredCount;


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div style={styles.page}>

            {/* =================================================
                QUIZ HEADER
            ================================================== */}

            <header style={styles.header}>

                <div>

                    <div style={styles.quizTitle}>
                        {quiz?.title}
                    </div>

                    <div style={styles.progress}>
                        Question{" "}
                        {currentIndex + 1}
                        {" "}of{" "}
                        {questions.length}
                    </div>

                </div>


                <div
                    style={{
                        ...styles.timer,

                        ...(timerWarning
                            ? styles.timerWarning
                            : {}),

                        ...(timerDanger
                            ? styles.timerDanger
                            : {})
                    }}
                >
                    ⏱ {formattedTime}
                </div>

            </header>


            {/* =================================================
                AUTO SUBMIT NOTICE
            ================================================== */}

            {autoSubmitted &&
                submitting && (

                <div
                    style={
                        styles.autoSubmitNotice
                    }
                >
                    ⏰ Time is up. Submitting
                    your quiz...
                </div>

            )}


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (

                <div style={styles.error}>
                    {error}
                </div>

            )}


            {/* =================================================
                MAIN CONTENT
            ================================================== */}

            <main style={styles.content}>

                {/* =================================================
                    QUESTION CARD
                ================================================== */}

                <section style={styles.questionCard}>

                    <div style={styles.questionBadge}>
                        Question{" "}
                        {currentIndex + 1}
                    </div>


                    <h1 style={styles.questionText}>
                        {currentQuestion.questionText}
                    </h1>


                    {/* OPTIONS */}

                    <div style={styles.options}>

                        {currentQuestion.options?.map(
                            (
                                option,
                                index
                            ) => {

                                const selected =
                                    selectedOption ===
                                    option.id;


                                return (

                                    <label
                                        key={
                                            option.id
                                        }
                                        style={{
                                            ...styles.option,

                                            ...(selected
                                                ? styles.optionSelected
                                                : {})
                                        }}
                                    >

                                        <input
                                            type="radio"
                                            name={
                                                `question-${currentQuestion.id}`
                                            }
                                            checked={
                                                selected
                                            }
                                            disabled={
                                                submitting
                                            }
                                            onChange={() =>
                                                selectAnswer(
                                                    currentQuestion.id,
                                                    option.id
                                                )
                                            }
                                        />


                                        <span
                                            style={
                                                styles.optionText
                                            }
                                        >

                                            <strong>
                                                {String.fromCharCode(
                                                    65 + index
                                                )}
                                                .
                                            </strong>

                                            {" "}

                                            {
                                                option.optionText
                                            }

                                        </span>

                                    </label>

                                );

                            }
                        )}

                    </div>


                    {/* QUESTION NAVIGATION */}

                    <div style={styles.navigation}>

                        <button
                            type="button"
                            disabled={
                                currentIndex === 0 ||
                                submitting
                            }
                            onClick={
                                goPrevious
                            }
                            style={
                                currentIndex === 0
                                    ? {
                                        ...styles.secondaryButton,
                                        ...styles.disabledButton
                                    }
                                    : styles.secondaryButton
                            }
                        >
                            ← Previous
                        </button>


                        {currentIndex <
                        questions.length - 1 ? (

                            <button
                                type="button"
                                disabled={
                                    submitting
                                }
                                onClick={
                                    goNext
                                }
                                style={
                                    styles.button
                                }
                            >
                                Next →
                            </button>

                        ) : (

                            <button
                                type="button"
                                disabled={
                                    submitting
                                }
                                onClick={() =>
                                    setShowSubmitModal(
                                        true
                                    )
                                }
                                style={
                                    styles.submitButton
                                }
                            >
                                Submit Quiz
                            </button>

                        )}

                    </div>

                </section>


                {/* =================================================
                    QUESTION NAVIGATOR
                ================================================== */}

                <aside style={styles.sidebar}>

                    <h3 style={styles.sidebarTitle}>
                        Questions
                    </h3>


                    <div
                        style={
                            styles.questionGrid
                        }
                    >

                        {questions.map(
                            (
                                question,
                                index
                            ) => {

                                const answered =
                                    answers[
                                        question.id
                                    ] !== undefined &&
                                    answers[
                                        question.id
                                    ] !== null;


                                const current =
                                    index ===
                                    currentIndex;


                                return (

                                    <button
                                        type="button"
                                        key={
                                            question.id
                                        }
                                        disabled={
                                            submitting
                                        }
                                        onClick={() =>
                                            goToQuestion(
                                                index
                                            )
                                        }
                                        style={{
                                            ...styles.questionButton,

                                            ...(current
                                                ? styles.currentQuestion
                                                : {}),

                                            ...(answered &&
                                            !current
                                                ? styles.answeredQuestion
                                                : {})
                                        }}
                                    >
                                        {index + 1}
                                    </button>

                                );

                            }
                        )}

                    </div>


                    {/* LEGEND */}

                    <div style={styles.legend}>

                        <div style={styles.legendItem}>

                            <span
                                style={{
                                    ...styles.legendDot,
                                    background:
                                        "#2563eb"
                                }}
                            />

                            Current

                        </div>


                        <div style={styles.legendItem}>

                            <span
                                style={{
                                    ...styles.legendDot,
                                    background:
                                        "#16a34a"
                                }}
                            />

                            Answered

                        </div>


                        <div style={styles.legendItem}>

                            <span
                                style={{
                                    ...styles.legendDot,
                                    background:
                                        "#e2e8f0"
                                }}
                            />

                            Unanswered

                        </div>

                    </div>


                    {/* STATS */}

                    <div style={styles.statsBox}>

                        <div
                            style={
                                styles.answeredBox
                            }
                        >

                            <strong
                                style={
                                    styles.answeredNumber
                                }
                            >
                                {answeredCount}
                            </strong>

                            <span
                                style={
                                    styles.statsLabel
                                }
                            >
                                Answered
                            </span>

                        </div>


                        <div
                            style={
                                styles.remainingBox
                            }
                        >

                            <strong
                                style={
                                    styles.remainingNumber
                                }
                            >
                                {unansweredCount}
                            </strong>

                            <span
                                style={
                                    styles.statsLabel
                                }
                            >
                                Remaining
                            </span>

                        </div>

                    </div>


                    {/* SIDEBAR SUBMIT */}

                    <button
                        type="button"
                        disabled={
                            submitting
                        }
                        onClick={() =>
                            setShowSubmitModal(
                                true
                            )
                        }
                        style={{
                            ...styles.sidebarSubmit,

                            ...(submitting
                                ? styles.disabledSubmit
                                : {})
                        }}
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Quiz"}
                    </button>

                </aside>

            </main>


            {/* =================================================
                SUBMIT MODAL
            ================================================== */}

            {showSubmitModal && (

                <div
                    style={
                        styles.modalOverlay
                    }
                >

                    <div style={styles.modal}>

                        <div
                            style={
                                styles.modalIcon
                            }
                        >
                            📤
                        </div>


                        <h2
                            style={
                                styles.modalTitle
                            }
                        >
                            Submit Quiz?
                        </h2>


                        <p
                            style={
                                styles.modalText
                            }
                        >
                            You have answered{" "}
                            <strong>
                                {answeredCount}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {questions.length}
                            </strong>{" "}
                            questions.
                        </p>


                        {unansweredCount > 0 && (

                            <div
                                style={
                                    styles.warning
                                }
                            >
                                ⚠️{" "}
                                {unansweredCount}{" "}
                                question
                                {unansweredCount >
                                1
                                    ? "s"
                                    : ""}{" "}
                                will remain unanswered.
                            </div>

                        )}


                        {unansweredCount === 0 && (

                            <div
                                style={
                                    styles.successNotice
                                }
                            >
                                ✓ All questions
                                have been answered.
                            </div>

                        )}


                        <div
                            style={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowSubmitModal(
                                        false
                                    )
                                }
                                style={
                                    styles.secondaryButton
                                }
                                disabled={
                                    submitting
                                }
                            >
                                Continue Quiz
                            </button>


                            <button
                                type="button"
                                onClick={() => {

                                    setShowSubmitModal(
                                        false
                                    );

                                    handleSubmit(
                                        false
                                    );

                                }}
                                style={
                                    styles.submitButton
                                }
                                disabled={
                                    submitting
                                }
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Yes, Submit"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


/* =============================================================
   STYLES
============================================================= */

const styles = {

    page: {
        minHeight: "100vh",
        background: "#f4f7fb"
    },


    header: {
        background: "#102a56",
        color: "#fff",
        padding: "18px 35px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
    },


    quizTitle: {
        fontSize: "20px",
        fontWeight: "700"
    },


    progress: {
        marginTop: "5px",
        fontSize: "13px",
        opacity: ".8"
    },


    timer: {
        background: "#fff",
        color: "#102a56",
        padding: "10px 18px",
        borderRadius: "8px",
        fontWeight: "800",
        fontSize: "18px",
        minWidth: "80px",
        textAlign: "center"
    },


    timerWarning: {
        background: "#fef3c7",
        color: "#a16207"
    },


    timerDanger: {
        background: "#fee2e2",
        color: "#b91c1c",
        animation:
            "pulse 1s infinite"
    },


    autoSubmitNotice: {
        maxWidth: "1100px",
        margin: "15px auto 0",
        background: "#fff7ed",
        color: "#c2410c",
        padding: "13px 18px",
        borderRadius: "8px",
        fontWeight: "600"
    },


    error: {
        maxWidth: "1100px",
        margin: "20px auto",
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "15px",
        borderRadius: "8px"
    },


    content: {
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "0 20px",
        display: "grid",
        gridTemplateColumns:
            "minmax(0, 1fr) 280px",
        gap: "25px"
    },


    questionCard: {
        background: "#fff",
        borderRadius: "14px",
        padding: "35px",
        boxShadow:
            "0 3px 12px rgba(0,0,0,.08)"
    },


    questionBadge: {
        display: "inline-block",
        background: "#eff6ff",
        color: "#2563eb",
        padding: "7px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "700"
    },


    questionText: {
        color: "#102a56",
        fontSize: "25px",
        lineHeight: "1.5",
        margin: "18px 0 30px"
    },


    options: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },


    option: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        border: "1px solid #dbe3ee",
        borderRadius: "10px",
        padding: "17px",
        cursor: "pointer",
        color: "#334155",
        transition:
            "all .15s ease"
    },


    optionSelected: {
        border:
            "2px solid #2563eb",
        background: "#eff6ff"
    },


    optionText: {
        fontSize: "15px"
    },


    navigation: {
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        marginTop: "30px"
    },


    sidebar: {
        background: "#fff",
        borderRadius: "14px",
        padding: "22px",
        height: "fit-content",
        boxShadow:
            "0 3px 12px rgba(0,0,0,.08)",
        position: "sticky",
        top: "20px"
    },


    sidebarTitle: {
        color: "#102a56",
        marginTop: 0
    },


    questionGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(5, 1fr)",
        gap: "8px"
    },


    questionButton: {
        border: "1px solid #cbd5e1",
        background: "#fff",
        padding: "10px 0",
        borderRadius: "7px",
        cursor: "pointer",
        fontWeight: "600"
    },


    currentQuestion: {
        background: "#2563eb",
        color: "#fff",
        borderColor: "#2563eb"
    },


    answeredQuestion: {
        background: "#dcfce7",
        color: "#15803d",
        borderColor: "#16a34a"
    },


    legend: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "18px",
        paddingTop: "15px",
        borderTop:
            "1px solid #e2e8f0",
        fontSize: "12px",
        color: "#64748b"
    },


    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },


    legendDot: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        display: "inline-block"
    },


    statsBox: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1fr",
        gap: "10px",
        marginTop: "20px"
    },


    answeredBox: {
        background: "#f0fdf4",
        padding: "12px",
        borderRadius: "8px",
        textAlign: "center"
    },


    remainingBox: {
        background: "#fff7ed",
        padding: "12px",
        borderRadius: "8px",
        textAlign: "center"
    },


    answeredNumber: {
        display: "block",
        fontSize: "20px",
        color: "#15803d"
    },


    remainingNumber: {
        display: "block",
        fontSize: "20px",
        color: "#c2410c"
    },


    statsLabel: {
        fontSize: "12px",
        color: "#64748b"
    },


    sidebarSubmit: {
        width: "100%",
        marginTop: "20px",
        border: "none",
        background: "#16a34a",
        color: "#fff",
        padding: "12px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer"
    },


    disabledSubmit: {
        background: "#94a3b8",
        cursor: "not-allowed"
    },


    button: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "12px 22px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer"
    },


    secondaryButton: {
        border: "none",
        background: "#e2e8f0",
        color: "#334155",
        padding: "12px 22px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer"
    },


    disabledButton: {
        opacity: ".55",
        cursor: "not-allowed"
    },


    submitButton: {
        border: "none",
        background: "#16a34a",
        color: "#fff",
        padding: "12px 22px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer"
    },


    center: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
    },


    loadingCard: {
        background: "#fff",
        padding: "40px",
        borderRadius: "14px",
        textAlign: "center",
        boxShadow:
            "0 4px 18px rgba(0,0,0,.08)"
    },


    loadingIcon: {
        fontSize: "40px",
        marginBottom: "10px"
    },


    loadingTitle: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#102a56"
    },


    loadingText: {
        marginTop: "8px",
        color: "#64748b"
    },


    errorCard: {
        background: "#fff",
        padding: "35px",
        borderRadius: "14px",
        textAlign: "center",
        maxWidth: "500px",
        boxShadow:
            "0 4px 18px rgba(0,0,0,.08)"
    },


    errorIcon: {
        fontSize: "42px",
        marginBottom: "10px"
    },


    modalOverlay: {
        position: "fixed",
        inset: 0,
        background:
            "rgba(15,23,42,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999
    },


    modal: {
        width: "100%",
        maxWidth: "450px",
        background: "#fff",
        borderRadius: "14px",
        padding: "30px",
        boxShadow:
            "0 20px 50px rgba(0,0,0,.25)"
    },


    modalIcon: {
        fontSize: "35px",
        marginBottom: "8px"
    },


    modalTitle: {
        color: "#102a56",
        margin: "0 0 10px"
    },


    modalText: {
        color: "#64748b",
        lineHeight: "1.6"
    },


    warning: {
        background: "#fef3c7",
        color: "#92400e",
        padding: "12px",
        borderRadius: "8px",
        marginTop: "15px",
        lineHeight: "1.5"
    },


    successNotice: {
        background: "#dcfce7",
        color: "#166534",
        padding: "12px",
        borderRadius: "8px",
        marginTop: "15px"
    },


    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "25px",
        flexWrap: "wrap"
    }

};