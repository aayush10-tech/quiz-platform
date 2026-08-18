import {
    FaBell,
    FaSignOutAlt,
    FaUserCircle
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

    const isAdmin = user?.role === "ADMIN";

    return (

        <header
            className="
                h-16
                bg-white
                shadow
                flex
                items-center
                justify-between
                px-8
            "
        >

            {/* LEFT SIDE */}

            <div>

                <h1
                    className="
                        text-xl
                        font-semibold
                        text-slate-700
                    "
                >
                    {isAdmin
                        ? "Admin Panel"
                        : "Student Panel"}
                </h1>

            </div>


            {/* RIGHT SIDE */}

            <div
                className="
                    flex
                    items-center
                    gap-6
                "
            >

                {/* Notification */}

                <button
                    className="
                        text-xl
                        text-slate-600
                        hover:text-blue-600
                    "
                    title="Notifications"
                >
                    <FaBell />
                </button>


                {/* User */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <FaUserCircle
                        size={34}
                        className="text-slate-600"
                    />

                    <div>

                        <p className="font-semibold">

                            {user?.name || "User"}

                        </p>

                        <p
                            className="
                                text-sm
                                text-slate-500
                            "
                        >

                            {user?.role || ""}

                        </p>

                    </div>

                </div>


                {/* Logout */}

                <button
                    onClick={handleLogout}
                    className="
                        flex
                        items-center
                        gap-2
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        px-4
                        py-2
                        rounded-lg
                    "
                >

                    <FaSignOutAlt />

                    Logout

                </button>

            </div>

        </header>

    );

}