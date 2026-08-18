import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import { loginService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function useLogin() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [loading, setLoading] = useState(false);

    const handleLogin = async (formData) => {

        try {

            setLoading(true);

            const response = await loginService(formData);

            login(response.token, response.user);

            toast.success(response.message);

            if (response.user.role === "ADMIN") {

                navigate("/admin");

            } else {

                navigate("/student");

            }

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Login Failed"

            );

        } finally {

            setLoading(false);

        }

    };

    return {

        loading,

        handleLogin

    };

}