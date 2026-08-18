import { useEffect, useState } from "react";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaSearch,
    FaGlobe,
    FaEyeSlash,
    FaSpinner,
} from "react-icons/fa";

import axios from "../../api/axios";

import {
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
} from "../../api/quiz.service";

import QuizForm from "./QuizForm";
import useQuizzes from "../../hooks/useQuizzes";

export default function Quizzes() {

    const {
        quizzes,
        pagination,
        loading,
        error,
        refresh,
    } = useQuizzes();

    const [categories, setCategories] = useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editingQuiz, setEditingQuiz] =
        useState(null);

    const [selectedQuizId, setSelectedQuizId] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [difficulty, setDifficulty] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [actionLoading, setActionLoading] =
        useState(null);

    const [message, setMessage] =
        useState({
            type: "",
            text: "",
        });

    const loadCategories = async () => {

        try {

            const response =
                await axios.get(
                    "/categories",
                    {
                        params: {
                            page: 1,
                            limit: 100,
                        },
                    }
                );

            const result =
                response.data?.data;

            const list =
                Array.isArray(result)
                    ? result
                    : result?.categories;

            setCategories(
                Array.isArray(list)
                    ? list
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load categories:",
                err
            );

        }

    };

    useEffect(() => {
        loadCategories();
    }, []);

    const loadWithFilters = (
        requestedPage = page
    ) => {

        refresh({
            page: requestedPage,
            limit: 10,
            search,
            category,
            difficulty,
            status,
        });

    };

    const handleSearch = (event) => {

        event.preventDefault();

        setPage(1);

        refresh({
            page: 1,
            limit: 10,
            search,
            category,
            difficulty,
            status,
        });

    };

    const clearFilters = () => {

        setSearch("");
        setCategory("");
        setDifficulty("");
        setStatus("");
        setPage(1);

        refresh({
            page: 1,
            limit: 10,
        });

    };

    const handleCreate = () => {

        setEditingQuiz(null);
        setShowForm(true);
        setMessage({
            type: "",
            text: "",
        });

    };

    const handleEdit = (quiz) => {

        setEditingQuiz(quiz);
        setShowForm(true);
        setSelectedQuizId(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };

    const handleFormSuccess = () => {

        setShowForm(false);
        setEditingQuiz(null);

        setMessage({
            type: "success",
            text: editingQuiz
                ? "Quiz updated successfully."
                : "Quiz created successfully.",
        });

        loadWithFilters(page);

    };

    const handleDelete = async (quiz) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${quiz.title}"?`
            );

        if (!confirmed) return;

        try {

            setActionLoading(
                `delete-${quiz.id}`
            );

            await deleteQuiz(quiz.id);

            setMessage({
                type: "success",
                text: "Quiz deleted successfully.",
            });

            if (selectedQuizId === quiz.id) {
                setSelectedQuizId(null);
            }

            loadWithFilters(page);

        } catch (err) {

            console.error(err);

            setMessage({
                type: "error",
                text:
                    err?.response?.data?.message ||
                    "Failed to delete quiz.",
            });

        } finally {

            setActionLoading(null);

        }

    };

    const handlePublishToggle = async (quiz) => {

        try {

            setActionLoading(
                `publish-${quiz.id}`
            );

            if (quiz.status === "PUBLISHED") {

                await unpublishQuiz(quiz.id);

                setMessage({
                    type: "success",
                    text: "Quiz moved to draft.",
                });

            } else {

                await publishQuiz(quiz.id);

                setMessage({
                    type: "success",
                    text: "Quiz published successfully.",
                });

            }

            loadWithFilters(page);

        } catch (err) {

            console.error(err);

            setMessage({
                type: "error",
                text:
                    err?.response?.data?.message ||
                    "Failed to update quiz status.",
            });

        } finally {

            setActionLoading(null);

        }

    };

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                pagination.total /
                pagination.limit
            )
        );

    if (selectedQuizId) {

        
    }

    return (

        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                <div>

                    <h1 className="text-4xl font-bold text-slate-900">
                        Quiz Management
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Create, manage, publish and organize quizzes.
                    </p>

                </div>

                <button
                    onClick={
                        showForm
                            ? () => {
                                setShowForm(false);
                                setEditingQuiz(null);
                            }
                            : handleCreate
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                    {showForm ? (
                        "Close"
                    ) : (
                        <>
                            <FaPlus />
                            Add Quiz
                        </>
                    )}
                </button>

            </div>

            {/* MESSAGE */}

            {message.text && (

                <div
                    className={`p-4 rounded-lg ${
                        message.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {message.text}
                </div>

            )}

            {/* FORM */}

            {showForm && (

                <QuizForm
                    quiz={editingQuiz}
                    categories={categories}
                    onSuccess={
                        handleFormSuccess
                    }
                    onCancel={() => {
                        setShowForm(false);
                        setEditingQuiz(null);
                    }}
                />

            )}

            {/* FILTERS */}

            <div className="bg-white rounded-xl shadow-md p-5">

                <form
                    onSubmit={handleSearch}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
                >

                    <div className="lg:col-span-2 relative">

                        <FaSearch
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search quiz..."
                            className="w-full border border-slate-300 rounded-lg pl-11 pr-4 py-3"
                        />

                    </div>

                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(
                                e.target.value
                            );
                            setPage(1);

                            refresh({
                                page: 1,
                                limit: 10,
                                search,
                                category:
                                    e.target.value,
                                difficulty,
                                status,
                            });
                        }}
                        className="border border-slate-300 rounded-lg px-4 py-3"
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

                    <select
                        value={difficulty}
                        onChange={(e) => {
                            setDifficulty(
                                e.target.value
                            );
                            setPage(1);

                            refresh({
                                page: 1,
                                limit: 10,
                                search,
                                category,
                                difficulty:
                                    e.target.value,
                                status,
                            });
                        }}
                        className="border border-slate-300 rounded-lg px-4 py-3"
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

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(
                                e.target.value
                            );
                            setPage(1);

                            refresh({
                                page: 1,
                                limit: 10,
                                search,
                                category,
                                difficulty,
                                status:
                                    e.target.value,
                            });
                        }}
                        className="border border-slate-300 rounded-lg px-4 py-3"
                    >

                        <option value="">
                            All Status
                        </option>

                        <option value="DRAFT">
                            Draft
                        </option>

                        <option value="PUBLISHED">
                            Published
                        </option>

                    </select>

                    <div className="md:col-span-2 lg:col-span-5 flex gap-3">

                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-lg"
                        >
                            Clear
                        </button>

                    </div>

                </form>

            </div>

            {/* ERROR */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                    {error}
                </div>

            )}

            {/* TABLE */}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[900px]">

                        <thead className="bg-slate-100">

                            <tr>

                                <th className="p-4 text-left">
                                    Title
                                </th>

                                <th className="p-4 text-left">
                                    Category
                                </th>

                                <th className="p-4 text-left">
                                    Difficulty
                                </th>

                                <th className="p-4 text-left">
                                    Duration
                                </th>

                                <th className="p-4 text-left">
                                    Status
                                </th>

                                <th className="p-4 text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="py-12"
                                    >

                                        <div className="flex justify-center">
                                            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                                        </div>

                                    </td>

                                </tr>

                            ) : quizzes.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center py-12 text-slate-500"
                                    >
                                        No quizzes found.
                                    </td>

                                </tr>

                            ) : (

                                quizzes.map(
                                    (quiz) => (

                                        <tr
                                            key={quiz.id}
                                            className="border-t hover:bg-slate-50"
                                        >

                                            <td className="p-4 font-semibold">
                                                {quiz.title}
                                            </td>

                                            <td className="p-4">
                                                {quiz.category?.name ||
                                                    "-"}
                                            </td>

                                            <td className="p-4">
                                                {quiz.difficulty}
                                            </td>

                                            <td className="p-4">
                                                {quiz.duration} mins
                                            </td>

                                            <td className="p-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        quiz.status ===
                                                        "PUBLISHED"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {quiz.status}
                                                </span>

                                            </td>

                                            <td className="p-4">

                                                <div className="flex justify-center gap-2 flex-wrap">

                                                    <button
                                                        title="View"
                                                        onClick={() =>
                                                            setSelectedQuizId(
                                                                quiz.id
                                                            )
                                                        }
                                                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg"
                                                    >
                                                        <FaEye />
                                                    </button>

                                                    <button
                                                        title="Edit"
                                                        onClick={() =>
                                                            handleEdit(
                                                                quiz
                                                            )
                                                        }
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg"
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        title={
                                                            quiz.status ===
                                                            "PUBLISHED"
                                                                ? "Unpublish"
                                                                : "Publish"
                                                        }
                                                        disabled={
                                                            actionLoading ===
                                                            `publish-${quiz.id}`
                                                        }
                                                        onClick={() =>
                                                            handlePublishToggle(
                                                                quiz
                                                            )
                                                        }
                                                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white p-3 rounded-lg"
                                                    >

                                                        {actionLoading ===
                                                        `publish-${quiz.id}` ? (
                                                            <FaSpinner className="animate-spin" />
                                                        ) : quiz.status ===
                                                          "PUBLISHED" ? (
                                                            <FaEyeSlash />
                                                        ) : (
                                                            <FaGlobe />
                                                        )}

                                                    </button>

                                                    <button
                                                        title="Delete"
                                                        disabled={
                                                            actionLoading ===
                                                            `delete-${quiz.id}`
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                quiz
                                                            )
                                                        }
                                                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white p-3 rounded-lg"
                                                    >

                                                        {actionLoading ===
                                                        `delete-${quiz.id}` ? (
                                                            <FaSpinner className="animate-spin" />
                                                        ) : (
                                                            <FaTrash />
                                                        )}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* PAGINATION */}

            {!loading &&
                pagination.total > 0 && (

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

                        <p className="text-slate-600">

                            Showing page{" "}
                            <strong>
                                {pagination.page}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {totalPages}
                            </strong>

                            {" "}(
                            {pagination.total} quizzes)

                        </p>

                        <div className="flex gap-2">

                            <button
                                disabled={page <= 1}
                                onClick={() => {
                                    const next =
                                        page - 1;

                                    setPage(next);

                                    loadWithFilters(
                                        next
                                    );
                                }}
                                className="px-4 py-2 rounded-lg bg-slate-200 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                disabled={
                                    page >=
                                    totalPages
                                }
                                onClick={() => {
                                    const next =
                                        page + 1;

                                    setPage(next);

                                    loadWithFilters(
                                        next
                                    );
                                }}
                                className="px-4 py-2 rounded-lg bg-slate-200 disabled:opacity-50"
                            >
                                Next
                            </button>

                        </div>

                    </div>

                )}

        </div>
    );
}