import { useCallback, useState } from "react";

import {
    getQuestionsByQuiz,
    getQuestionById,
    createQuestion,
    deleteQuestion
} from "../services/question.service";

const useQuestions = () => {

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadQuestions = useCallback(async (quizId) => {

        if (!quizId) {
            setQuestions([]);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await getQuestionsByQuiz(quizId);

            console.log("QUESTIONS RESPONSE:", response);

            const questionData = response?.data;

            setQuestions(
                Array.isArray(questionData)
                    ? questionData
                    : []
            );

        } catch (err) {

            console.error("QUESTIONS ERROR:", err);

            setQuestions([]);

            setError(
                err?.response?.data?.message ||
                "Failed to load questions"
            );

        } finally {

            setLoading(false);

        }

    }, []);

    const getQuestion = async (id) => {

        try {

            setError("");

            const response = await getQuestionById(id);

            return response?.data || null;

        } catch (err) {

            console.error("QUESTION DETAILS ERROR:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to load question"
            );

            return null;
        }

    };

    const addQuestion = async (questionData) => {

        try {

            setSaving(true);
            setError("");

            const response = await createQuestion(questionData);

            console.log("CREATE QUESTION RESPONSE:", response);

            return {
                success: true,
                data: response?.data
            };

        } catch (err) {

            console.error("CREATE QUESTION ERROR:", err);

            const message =
                err?.response?.data?.message ||
                "Failed to create question";

            setError(message);

            return {
                success: false,
                message
            };

        } finally {

            setSaving(false);

        }

    };

    const removeQuestion = async (id) => {

        try {

            setError("");

            await deleteQuestion(id);

            setQuestions((current) =>
                current.filter((question) => question.id !== id)
            );

            return true;

        } catch (err) {

            console.error("DELETE QUESTION ERROR:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to delete question"
            );

            return false;

        }

    };

    return {
        questions,
        loading,
        saving,
        error,
        loadQuestions,
        getQuestion,
        addQuestion,
        removeQuestion
    };
};

export default useQuestions;