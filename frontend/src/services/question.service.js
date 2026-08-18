import api from "../api/axios";

export const getQuestionsByQuiz = async (quizId) => {
    const response = await api.get(`/questions/quiz/${quizId}`);
    return response.data;
};

export const getQuestionById = async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
};

export const createQuestion = async (questionData) => {
    const response = await api.post("/questions", questionData);
    return response.data;
};

export const deleteQuestion = async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
};