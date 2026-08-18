import axios from "./axios";

export const getQuizzes = async ({
    page = 1,
    limit = 10,
    search = "",
    category = "",
    difficulty = "",
    status = "",
} = {}) => {
    const response = await axios.get("/quizzes", {
        params: {
            page,
            limit,
            ...(search && { search }),
            ...(category && { category }),
            ...(difficulty && { difficulty }),
            ...(status && { status }),
        },
    });

    return response.data.data;
};

export const getQuizById = async (id) => {
    const response = await axios.get(`/quizzes/${id}`);
    return response.data.data;
};

export const createQuiz = async (payload) => {
    const response = await axios.post("/quizzes", payload);
    return response.data.data;
};

export const updateQuiz = async (id, payload) => {
    const response = await axios.put(`/quizzes/${id}`, payload);
    return response.data.data;
};

export const deleteQuiz = async (id) => {
    const response = await axios.delete(`/quizzes/${id}`);
    return response.data;
};

export const publishQuiz = async (id) => {
    const response = await axios.patch(`/quizzes/${id}/publish`);
    return response.data.data;
};

export const unpublishQuiz = async (id) => {
    const response = await axios.patch(`/quizzes/${id}/unpublish`);
    return response.data.data;
};

/*
 * Question APIs
 *
 * These match your current backend question routes.
 */

export const getQuizQuestions = async (quizId) => {
    const response = await axios.get(`/questions/quiz/${quizId}`);
    return response.data.data;
};

export const createQuestion = async (payload) => {
    const response = await axios.post("/questions", payload);
    return response.data.data;
};

export const deleteQuestion = async (id) => {
    const response = await axios.delete(`/questions/${id}`);
    return response.data;
};