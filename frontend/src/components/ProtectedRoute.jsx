import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role }) {

    const {
        loading,
        isAuthenticated,
        user
    } = useAuth();

    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">

                <div className="text-lg text-slate-600">
                    Checking session...
                </div>

            </div>
        );

    }

    if (!isAuthenticated || !user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }

    if (role && user.role !== role) {

        if (user.role === "ADMIN") {

            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );

        }

        if (user.role === "STUDENT") {

            return (
                <Navigate
                    to="/student"
                    replace
                />
            );

        }

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }

    return <Outlet />;

}