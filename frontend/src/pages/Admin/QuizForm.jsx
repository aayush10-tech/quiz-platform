import { useEffect, useState } from "react";
import {
    FaSave,
    FaTimes,
    FaSpinner,
} from "react-icons/fa";

import {
    createQuiz,
    updateQuiz,
} from "../../api/quiz.service";

export default function QuizForm({
    quiz = null,
    categories = [],
    onSuccess,
    onCancel,
}) {
    const isEdit = Boolean(quiz);

    const [form, setForm] = useState({
        title: "",
        description: "",
        instructions: "",
        duration: 20,
        passingScore: 60,
        maxAttempts: 2,

        // Negative marking
        negativeMarks: 0.5,

        difficulty: "MEDIUM",
        categoryId: "",
        thumbnail: "",
        isFeatured: false,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (quiz) {

            setForm({
                title: quiz.title || "",

                description:
                    quiz.description || "",

                instructions:
                    quiz.instructions || "",

                duration:
                    quiz.duration ?? 20,

                passingScore:
                    quiz.passingScore ?? 60,

                maxAttempts:
                    quiz.maxAttempts ?? 2,

                negativeMarks:
                    quiz.negativeMarks ?? 0.5,

                difficulty:
                    quiz.difficulty || "MEDIUM",

                categoryId:
                    quiz.categoryId ?? "",

                thumbnail:
                    quiz.thumbnail || "",

                isFeatured:
                    Boolean(quiz.isFeatured),
            });

        } else {

            setForm({
                title: "",
                description: "",
                instructions: "",
                duration: 20,
                passingScore: 60,
                maxAttempts: 2,
                negativeMarks: 0.5,
                difficulty: "MEDIUM",
                categoryId: "",
                thumbnail: "",
                isFeatured: false,
            });

        }

        setError("");

    }, [quiz]);


    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((previous) => ({

            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,

        }));

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        /* =========================
           BASIC VALIDATION
        ========================= */

        if (
            form.title.trim().length < 3
        ) {

            setError(
                "Quiz title must be at least 3 characters."
            );

            return;

        }


        if (
            form.description.trim().length < 10
        ) {

            setError(
                "Description must be at least 10 characters."
            );

            return;

        }


        if (!form.categoryId) {

            setError(
                "Please select a category."
            );

            return;

        }


        const duration =
            Number(form.duration);

        const passingScore =
            Number(form.passingScore);

        const maxAttempts =
            Number(form.maxAttempts);

        const negativeMarks =
            Number(form.negativeMarks);


        if (
            !Number.isFinite(duration) ||
            duration < 1
        ) {

            setError(
                "Duration must be at least 1 minute."
            );

            return;

        }


        if (
            !Number.isFinite(passingScore) ||
            passingScore < 1 ||
            passingScore > 100
        ) {

            setError(
                "Passing score must be between 1 and 100."
            );

            return;

        }


        if (
            !Number.isFinite(maxAttempts) ||
            maxAttempts < 1
        ) {

            setError(
                "Maximum attempts must be at least 1."
            );

            return;

        }


        if (
            !Number.isFinite(negativeMarks) ||
            negativeMarks < 0
        ) {

            setError(
                "Negative marks cannot be less than 0."
            );

            return;

        }


        /*
         * Payload sent to backend.
         *
         * Example:
         *
         * negativeMarks: 0.5
         */

        const payload = {

            title:
                form.title.trim(),

            description:
                form.description.trim(),

            instructions:
                form.instructions.trim(),

            duration,

            passingScore,

            maxAttempts,

            negativeMarks,

            difficulty:
                form.difficulty,

            categoryId:
                Number(form.categoryId),

            thumbnail:
                form.thumbnail.trim(),

            isFeatured:
                Boolean(form.isFeatured),

        };


        try {

            setSaving(true);


            if (isEdit) {

                await updateQuiz(
                    quiz.id,
                    payload
                );

            } else {

                await createQuiz(
                    payload
                );

            }


            onSuccess?.();

        } catch (err) {

            console.error(
                "Quiz save failed:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to save quiz."
            );

        } finally {

            setSaving(false);

        }

    };


    return (

        <div className="bg-white rounded-xl shadow-md p-6">

            {/* HEADER */}

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-slate-900">

                    {isEdit
                        ? "Edit Quiz"
                        : "Create Quiz"}

                </h2>


                {onCancel && (

                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-slate-500 hover:text-slate-900"
                    >
                        <FaTimes size={20} />
                    </button>

                )}

            </div>


            {/* ERROR */}

            {error && (

                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">

                    {error}

                </div>

            )}


            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >

                {/* TITLE */}

                <div>

                    <label className="block font-semibold mb-2">
                        Quiz Title
                    </label>

                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter quiz title"
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    />

                </div>


                {/* DESCRIPTION */}

                <div>

                    <label className="block font-semibold mb-2">
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe the quiz"
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    />

                </div>


                {/* INSTRUCTIONS */}

                <div>

                    <label className="block font-semibold mb-2">
                        Instructions
                    </label>

                    <textarea
                        name="instructions"
                        value={form.instructions}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Instructions for students"
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    />

                </div>


                {/* CATEGORY + DIFFICULTY */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* CATEGORY */}

                    <div>

                        <label className="block font-semibold mb-2">
                            Category
                        </label>

                        <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3"
                        >

                            <option value="">
                                Select category
                            </option>

                            {categories.map(
                                (category) => (

                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* DIFFICULTY */}

                    <div>

                        <label className="block font-semibold mb-2">
                            Difficulty
                        </label>

                        <select
                            name="difficulty"
                            value={form.difficulty}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3"
                        >

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

                    </div>

                </div>


                {/* QUIZ SETTINGS */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* DURATION */}

                    <div>

                        <label className="block font-semibold mb-2">
                            Duration (minutes)
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="duration"
                            value={form.duration}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3"
                        />

                    </div>


                    {/* PASSING SCORE */}

                    <div>

                        <label className="block font-semibold mb-2">
                            Passing Score (%)
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="100"
                            name="passingScore"
                            value={form.passingScore}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3"
                        />

                    </div>


                    {/* MAX ATTEMPTS */}

                    <div>

                        <label className="block font-semibold mb-2">
                            Maximum Attempts
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="maxAttempts"
                            value={form.maxAttempts}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3"
                        />

                    </div>


                    {/* NEGATIVE MARKS */}

                    <div>

                        <label className="block font-semibold mb-2">
                            Negative Marks
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.25"
                            name="negativeMarks"
                            value={form.negativeMarks}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3"
                        />

                        <p className="text-xs text-slate-500 mt-2">
                            Marks deducted for each wrong answer.
                        </p>

                    </div>

                </div>


                {/* SCORING INFORMATION */}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

                    <h3 className="font-semibold text-blue-900 mb-2">
                        Scoring Rules
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">

                        <div className="bg-white rounded-lg p-3">

                            <span className="block text-slate-500">
                                Correct Answer
                            </span>

                            <strong className="text-green-600">
                                + Question Marks
                            </strong>

                        </div>


                        <div className="bg-white rounded-lg p-3">

                            <span className="block text-slate-500">
                                Wrong Answer
                            </span>

                            <strong className="text-red-600">
                                - {form.negativeMarks || 0}
                            </strong>

                        </div>


                        <div className="bg-white rounded-lg p-3">

                            <span className="block text-slate-500">
                                Skipped
                            </span>

                            <strong className="text-slate-600">
                                0
                            </strong>

                        </div>

                    </div>

                </div>


                {/* THUMBNAIL */}

                <div>

                    <label className="block font-semibold mb-2">
                        Thumbnail URL
                    </label>

                    <input
                        name="thumbnail"
                        value={form.thumbnail}
                        onChange={handleChange}
                        placeholder="Optional image URL"
                        className="w-full border border-slate-300 rounded-lg px-4 py-3"
                    />

                </div>


                {/* FEATURED */}

                <label className="flex items-center gap-3">

                    <input
                        type="checkbox"
                        name="isFeatured"
                        checked={form.isFeatured}
                        onChange={handleChange}
                        className="w-4 h-4"
                    />

                    <span className="font-medium">
                        Mark as featured quiz
                    </span>

                </label>


                {/* ACTIONS */}

                <div className="flex gap-3 pt-3">

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >

                        {saving ? (

                            <FaSpinner
                                className="animate-spin"
                            />

                        ) : (

                            <FaSave />

                        )}

                        {saving
                            ? "Saving..."
                            : isEdit
                                ? "Update Quiz"
                                : "Save Quiz"}

                    </button>


                    {onCancel && (

                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-lg"
                        >
                            Cancel
                        </button>

                    )}

                </div>

            </form>

        </div>

    );

}