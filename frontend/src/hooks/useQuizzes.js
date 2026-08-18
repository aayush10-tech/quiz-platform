import { useCallback, useEffect, useState } from "react";
import { getQuizzes } from "../api/quiz.service";

export default function useQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchQuizzes = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError("");

            const result = await getQuizzes(filters);

            setQuizzes(
                Array.isArray(result?.quizzes)
                    ? result.quizzes
                    : []
            );

            setPagination({
                total: Number(result?.total || 0),
                page: Number(result?.page || 1),
                limit: Number(result?.limit || 10),
            });
        } catch (err) {
            console.error("Failed to load quizzes:", err);

            setQuizzes([]);
            setError(
                err?.response?.data?.message ||
                "Failed to load quizzes."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    return {
        quizzes,
        pagination,
        loading,
        error,
        refresh: fetchQuizzes,
    };
}