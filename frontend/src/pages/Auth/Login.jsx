import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    FaEnvelope,
    FaLock,
    FaUserShield,
    FaUserGraduate
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import useLogin from "../../hooks/useLogin";

export default function Login() {

    const [selectedRole, setSelectedRole] = useState("STUDENT");

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const {
        loading,
        handleLogin
    } = useLogin();

    const submitLogin = async (formData) => {

        try {

            /*
             * First perform the normal login.
             * Your existing useLogin already handles:
             * - API request
             * - storing token
             * - storing user
             * - redirect
             */

            await handleLogin(formData);

        } catch (error) {

            console.error("Login error:", error);

        }

    };

    return (

        <div className="
            min-h-screen
            bg-slate-100
            flex
            items-center
            justify-center
            px-4
            py-8
        ">

            <div className="
                bg-white
                w-full
                max-w-md
                rounded-2xl
                shadow-xl
                p-5
                sm:p-8
            ">

                {/* HEADER */}

                <div className="text-center mb-6">

                    <h1 className="
                        text-2xl
                        sm:text-3xl
                        font-bold
                        text-slate-800
                    ">
                        Quiz Platform
                    </h1>

                    <p className="
                        text-sm
                        sm:text-base
                        text-slate-500
                        mt-2
                    ">
                        Sign in to continue
                    </p>

                </div>


                {/* ROLE SELECTOR */}

                <div className="mb-6">

                    <p className="
                        text-sm
                        font-medium
                        text-slate-700
                        mb-2
                    ">
                        Login as
                    </p>

                    <div className="
                        grid
                        grid-cols-2
                        gap-2
                        bg-slate-100
                        p-1
                        rounded-xl
                    ">

                        {/* STUDENT */}

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedRole("STUDENT")
                            }
                            className={`
                                flex
                                items-center
                                justify-center
                                gap-2
                                py-3
                                rounded-lg
                                font-semibold
                                text-sm
                                sm:text-base
                                transition
                                ${
                                    selectedRole === "STUDENT"
                                        ? "bg-white text-blue-600 shadow"
                                        : "text-slate-500"
                                }
                            `}
                        >

                            <FaUserGraduate />

                            Student

                        </button>


                        {/* ADMIN */}

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedRole("ADMIN")
                            }
                            className={`
                                flex
                                items-center
                                justify-center
                                gap-2
                                py-3
                                rounded-lg
                                font-semibold
                                text-sm
                                sm:text-base
                                transition
                                ${
                                    selectedRole === "ADMIN"
                                        ? "bg-white text-blue-600 shadow"
                                        : "text-slate-500"
                                }
                            `}
                        >

                            <FaUserShield />

                            Admin

                        </button>

                    </div>

                </div>


                {/* SELECTED ROLE */}

                <div className="
                    bg-blue-50
                    border
                    border-blue-100
                    rounded-lg
                    px-4
                    py-3
                    mb-5
                    text-center
                ">

                    <p className="
                        text-sm
                        text-blue-700
                        font-medium
                    ">

                        {selectedRole === "ADMIN"
                            ? "Admin Login"
                            : "Student Login"
                        }

                    </p>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit(submitLogin)}
                    className="space-y-4"
                >

                    {/* EMAIL */}

                    <div>

                        <label className="
                            block
                            mb-2
                            text-sm
                            font-medium
                            text-slate-700
                        ">
                            Email
                        </label>

                        <div className="
                            flex
                            items-center
                            border
                            rounded-lg
                            px-3
                            focus-within:ring-2
                            focus-within:ring-blue-500
                        ">

                            <FaEnvelope
                                className="text-gray-400 shrink-0"
                            />

                            <input
                                type="email"
                                placeholder="Enter email"
                                autoComplete="email"
                                className="
                                    w-full
                                    p-3
                                    text-sm
                                    sm:text-base
                                    outline-none
                                    min-w-0
                                "
                                {...register("email", {
                                    required:
                                        "Email is required"
                                })}
                            />

                        </div>

                        {errors.email && (

                            <p className="
                                text-red-500
                                text-xs
                                mt-1
                            ">
                                {errors.email.message}
                            </p>

                        )}

                    </div>


                    {/* PASSWORD */}

                    <div>

                        <label className="
                            block
                            mb-2
                            text-sm
                            font-medium
                            text-slate-700
                        ">
                            Password
                        </label>

                        <div className="
                            flex
                            items-center
                            border
                            rounded-lg
                            px-3
                            focus-within:ring-2
                            focus-within:ring-blue-500
                        ">

                            <FaLock
                                className="text-gray-400 shrink-0"
                            />

                            <input
                                type="password"
                                placeholder="Enter password"
                                autoComplete="current-password"
                                className="
                                    w-full
                                    p-3
                                    text-sm
                                    sm:text-base
                                    outline-none
                                    min-w-0
                                "
                                {...register("password", {
                                    required:
                                        "Password is required"
                                })}
                            />

                        </div>

                        {errors.password && (

                            <p className="
                                text-red-500
                                text-xs
                                mt-1
                            ">
                                {errors.password.message}
                            </p>

                        )}

                    </div>
                    <div className="text-right">

    <Link
        to="/forgot-password"
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
    >
        Forgot Password?
    </Link>

</div>


                    {/* LOGIN */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:bg-blue-400
                            disabled:cursor-not-allowed
                            text-white
                            py-3
                            rounded-lg
                            font-semibold
                            text-sm
                            sm:text-base
                            transition
                        "
                    >

                        {loading
                            ? "Logging in..."
                            : `Login as ${
                                selectedRole === "ADMIN"
                                    ? "Admin"
                                    : "Student"
                            }`
                        }

                    </button>

                </form>


                <p className="
                    text-center
                    text-xs
                    text-slate-400
                    mt-6
                ">
                    Secure access to Quiz Platform
                </p>

            </div>

        </div>

    );
}