import api from "../api/axios";

export const startAttempt = async (quizId) => {
    const response = await api.post(
        `/attempts/start/${quizId}`
    );

    return response.data;
};

export const submitAttempt = async (
    attemptId,
    answers
) => {
    const response = await api.post(
        "/attempts/submit",
        {
            attemptId: Number(attemptId),
            answers
        }
    );

    return response.data;
};

export const getAttemptResult = async (attemptId) => {
    const response = await api.get(
        `/attempts/result/${attemptId}`
    );

    return response.data;
};

export const getMyAttempts = async () => {
    const response = await api.get(
        "/attempts/my-attempts"
    );

    return response.data;
};