import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(

    (config) => {

        const token = sessionStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;

    },

    (error) => Promise.reject(error)

);

api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            if (window.location.pathname !== "/login") {

                window.location.href = "/login";

            }

        }

        return Promise.reject(error);

    }

);

export default api;