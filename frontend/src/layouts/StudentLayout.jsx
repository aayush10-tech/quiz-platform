import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function StudentLayout() {

    const location = useLocation();

    const path = location.pathname;

    const isDashboard =
        path === "/student";

    const isQuizzes =
        path === "/student/quizzes" ||
        path.startsWith("/student/quiz/");

    const isAttempts =
        path === "/student/attempts" ||
        path.startsWith("/student/result/");

    const goToDashboardSection = (section) => {

        if (path === "/student") {

            const element =
                document.getElementById(section);

            if (element) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

            return;
        }

        window.location.href =
            `/student#${section}`;
    };


    return (

        <div className="min-h-screen bg-slate-100">

            {/* =====================================================
                FIXED STUDENT SIDEBAR
            ====================================================== */}

            <aside
                className="
                    fixed
                    left-0
                    top-0
                    bottom-0
                    z-50
                    w-64
                    bg-blue-900
                    text-white
                    p-5
                    overflow-y-auto
                "
            >

                {/* LOGO */}

                <div className="mb-10">

                    <h1
                        className="
                            text-2xl
                            font-bold
                            tracking-tight
                        "
                    >
                        Quiz Portal
                    </h1>

                    <p
                        className="
                            text-blue-200
                            text-sm
                            mt-1
                        "
                    >
                        Student Portal
                    </p>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <nav className="space-y-2">

                    {/* DASHBOARD */}

                    <Link
                        to="/student"
                        className={`
                            flex
                            items-center
                            gap-3
                            w-full
                            px-4
                            py-3
                            rounded-lg
                            font-medium
                            transition-all
                            ${
                                isDashboard
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                            }
                        `}
                    >

                        <span>
                            🏠
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </Link>


                    {/* QUIZZES */}

                    <Link
                        to="/student/quizzes"
                        className={`
                            flex
                            items-center
                            gap-3
                            w-full
                            px-4
                            py-3
                            rounded-lg
                            font-medium
                            transition-all
                            ${
                                isQuizzes
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                            }
                        `}
                    >

                        <span>
                            📝
                        </span>

                        <span>
                            Quizzes
                        </span>

                    </Link>


                    {/* ATTEMPTS */}

                    <Link
                        to="/student/attempts"
                        className={`
                            flex
                            items-center
                            gap-3
                            w-full
                            px-4
                            py-3
                            rounded-lg
                            font-medium
                            transition-all
                            ${
                                isAttempts
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                            }
                        `}
                    >

                        <span>
                            📊
                        </span>

                        <span>
                            Attempts
                        </span>

                    </Link>


                    {/* LEADERBOARD */}

                    <button
                        type="button"
                        onClick={() =>
                            goToDashboardSection(
                                "leaderboard"
                            )
                        }
                        className="
                            flex
                            items-center
                            gap-3
                            w-full
                            px-4
                            py-3
                            rounded-lg
                            font-medium
                            transition-all
                            text-left
                            border-none
                            cursor-pointer
                            bg-transparent
                            text-blue-100
                            hover:bg-blue-800
                            hover:text-white
                        "
                    >

                        <span>
                            🏆
                        </span>

                        <span>
                            Leaderboard
                        </span>

                    </button>

                </nav>


                {/* =================================================
                    SIDEBAR FOOTER
                ================================================== */}

                <div
                    className="
                        absolute
                        bottom-5
                        left-5
                        right-5
                        border-t
                        border-blue-800
                        pt-4
                    "
                >

                    <p
                        className="
                            text-xs
                            text-blue-300
                        "
                    >
                        Quiz Management Platform
                    </p>

                </div>

            </aside>


            {/* =====================================================
                MAIN APPLICATION
            ====================================================== */}

            <div
                className="
                    ml-64
                    min-h-screen
                "
            >

                {/* HEADER */}

                <div
                    className="
                        sticky
                        top-0
                        z-40
                    "
                >
                    <Navbar />
                </div>


                {/* PAGE CONTENT */}

                <main
                    className="
                        min-h-screen
                        bg-slate-100
                        p-6
                    "
                >

                    <Outlet />

                </main>

            </div>

        </div>

    );
}