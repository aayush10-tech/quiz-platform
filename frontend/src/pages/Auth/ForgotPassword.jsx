import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

import { forgotPasswordService } from "../../services/auth.service";

export default function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetUrl, setResetUrl] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!email.trim()) {

            toast.error("Please enter your email");

            return;

        }

        try {

            setLoading(true);
            setResetUrl("");

            const response =
                await forgotPasswordService(
                    email.trim()
                );

            toast.success(
                response.message ||
                "Password reset request processed"
            );

            /*
             * Development mode:
             * Backend provides the reset URL because
             * email sending has not been configured yet.
             */

            if (response.resetUrl) {

                setResetUrl(
                    response.resetUrl
                );

            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to process request"
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
                        Reset your password
                    </p>

                </div>


                <div className="mb-6">

                    <p className="text-sm text-slate-600 leading-6">
                        Enter your registered email address
                        and we'll help you reset your password.
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="block mb-2 font-medium">
                            Email
                        </label>

                        <div className="flex items-center border rounded-lg px-3">

                            <FaEnvelope className="text-gray-400" />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                className="w-full p-3 outline-none"
                                autoComplete="email"
                            />

                        </div>

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition"
                    >

                        {loading
                            ? "Processing..."
                            : "Send Reset Link"}

                    </button>

                </form>


                {/* DEVELOPMENT RESET LINK */}

                {resetUrl && (

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">

                        <p className="text-sm font-semibold text-blue-800 mb-2">
                            Development Reset Link
                        </p>

                        <p className="text-xs text-blue-700 mb-3 break-all">
                            Email sending is not configured yet.
                        </p>

                        <Link
                            to={
                                resetUrl.replace(
                                    window.location.origin,
                                    ""
                                )
                            }
                            className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                            Open Reset Password
                        </Link>

                    </div>

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