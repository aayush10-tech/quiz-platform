import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowLeft
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
    resetPasswordService
} from "../../services/auth.service";

export default function ResetPassword() {

    const [searchParams] =
        useSearchParams();

    const navigate =
        useNavigate();

    const token =
        searchParams.get("token");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!token) {

            toast.error(
                "Invalid or missing reset token"
            );

            return;

        }


        if (password.length < 6) {

            toast.error(
                "Password must be at least 6 characters"
            );

            return;

        }


        if (password !== confirmPassword) {

            toast.error(
                "Passwords do not match"
            );

            return;

        }


        try {

            setLoading(true);


            const response =
                await resetPasswordService(
                    token,
                    password
                );


            toast.success(
                response.message ||
                "Password reset successfully"
            );


            setTimeout(() => {

                navigate("/login");

            }, 1200);


        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to reset password"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

            <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 sm:p-8">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Quiz Platform
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Create a new password
                    </p>

                </div>


                {!token ? (

                    <div className="text-center">

                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">

                            Invalid or missing
                            password reset token.

                        </div>


                        <Link
                            to="/forgot-password"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Request a new reset link
                        </Link>

                    </div>

                ) : (

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* PASSWORD */}

                        <div>

                            <label className="block mb-2 font-medium">
                                New Password
                            </label>

                            <div className="flex items-center border rounded-lg px-3">

                                <FaLock className="text-gray-400" />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                    className="w-full p-3 outline-none"
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="text-gray-400 hover:text-gray-600"
                                >

                                    {showPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />}

                                </button>

                            </div>

                            <p className="text-xs text-slate-500 mt-2">
                                Minimum 6 characters
                            </p>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div>

                            <label className="block mb-2 font-medium">
                                Confirm Password
                            </label>

                            <div className="flex items-center border rounded-lg px-3">

                                <FaLock className="text-gray-400" />

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        confirmPassword
                                    }
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    className="w-full p-3 outline-none"
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="text-gray-400 hover:text-gray-600"
                                >

                                    {showConfirmPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />}

                                </button>

                            </div>

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition"
                        >

                            {loading
                                ? "Resetting Password..."
                                : "Reset Password"}

                        </button>

                    </form>

                )}


                <div className="mt-7 text-center">

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >

                        <FaArrowLeft />

                        Back to Login

                    </Link>

                </div>

            </div>

        </div>

    );

}