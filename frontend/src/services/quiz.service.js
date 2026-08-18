import api from "../api/axios";

export const getQuizzes = async (params = {}) => {
    const response = await api.get("/quizzes", {
        params
    });

    return response.data;
};

export const getQuizById = async (id) => {
    const response = await api.get(`/quizzes/${id}`);

    return response.data;
};