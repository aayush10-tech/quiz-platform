import api from "../api/axios";

export const loginService = async (data) => {

    const response =
        await api.post(
            "/auth/login",
            data
        );

    return response.data;

};


/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPasswordService =
    async (email) => {

        const response =
            await api.post(
                "/auth/forgot-password",
                {
                    email
                }
            );

        return response.data;

    };


/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPasswordService =
    async (token, password) => {

        const response =
            await api.post(
                "/auth/reset-password",
                {
                    token,
                    password
                }
            );

        return response.data;

    };