import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaLayerGroup,
    FaBook,
    FaQuestionCircle,
    FaUsers,
    FaChartBar
} from "react-icons/fa";

const menus = [

    {
        name: "Dashboard",
        path: "/admin",
        icon: <FaHome />
    },

    {
        name: "Categories",
        path: "/admin/categories",
        icon: <FaLayerGroup />
    },

    {
        name: "Quizzes",
        path: "/admin/quizzes",
        icon: <FaBook />
    },

    {
        name: "Questions",
        path: "/admin/questions",
        icon: <FaQuestionCircle />
    },

    {
        name: "Students",
        path: "/admin/students",
        icon: <FaUsers />
    },

    {
        name: "Reports",
        path: "/admin/reports",
        icon: <FaChartBar />
    }

];

export default function Sidebar() {

    return (

        <aside className="w-64 min-h-screen bg-slate-900 text-white">

            <div className="text-2xl font-bold p-6 border-b border-slate-700">

                Quiz Platform

            </div>

            <nav className="mt-5">

                {

                    menus.map((menu) => (

                        <NavLink

                            key={menu.path}

                            to={menu.path}

                            end={menu.path === "/admin"}

                            className={({ isActive }) =>

                                `flex items-center gap-3 px-6 py-4 transition

                                ${

                                    isActive

                                        ? "bg-blue-600"

                                        : "hover:bg-slate-800"

                                }`

                            }

                        >

                            {menu.icon}

                            {menu.name}

                        </NavLink>

                    ))

                }

            </nav>

        </aside>

    );

}