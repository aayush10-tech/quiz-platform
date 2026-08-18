import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {

    const { user, logout } = useAuth();

    return (

        <div className="min-h-screen flex">

            <aside className="w-64 bg-slate-900 text-white p-5">

                <h1 className="text-2xl font-bold mb-8">
                    Quiz Admin
                </h1>

                <nav className="space-y-3">

                    <Link
                        className="block hover:text-blue-400"
                        to="/admin"
                    >
                        Dashboard
                    </Link>

                    <Link
                        className="block hover:text-blue-400"
                        to="/admin/categories"
                    >
                        Categories
                    </Link>

                    <Link
                        className="block hover:text-blue-400"
                        to="/admin/quizzes"
                    >
                        Quizzes
                    </Link>

                    <Link
                        className="block hover:text-blue-400"
                        to="/admin/questions"
                    >
                        Questions
                    </Link>

                    <Link
                        className="block hover:text-blue-400"
                        to="/admin/users"
                    >
                        Users
                    </Link>

                </nav>

            </aside>

            <div className="flex-1">

                <header className="bg-white shadow p-4 flex justify-between">

                    <h2 className="font-semibold">
                        Welcome {user?.name}
                    </h2>

                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>

                </header>

                <main className="p-6 bg-slate-100 min-h-screen">

                    <Outlet />

                </main>

            </div>

        </div>

    );

}