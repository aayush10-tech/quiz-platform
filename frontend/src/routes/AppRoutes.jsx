import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

import AdminDashboard from "../pages/Admin/Dashboard";
import Categories from "../pages/Admin/Categories";
import Quizzes from "../pages/Admin/Quizzes";
import Questions from "../pages/Admin/Questions";
import Students from "../pages/Admin/Students";
import Reports from "../pages/Admin/Reports";

import StudentDashboard from "../pages/Student/Dashboard";
import Attempts from "../pages/Student/Attempts";
import QuizDetails from "../pages/Student/Quiz/QuizDetails";
import QuizAttempt from "../pages/Student/Quiz/QuizAttempt";
import Result from "../pages/Student/Quiz/Result";

import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import StudentQuizzes from "../pages/Student/Quizzes";
export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    PUBLIC ROUTES
                ========================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />


                {/* =========================
                    ADMIN ROUTES
                ========================== */}

                <Route
                    element={
                        <ProtectedRoute role="ADMIN" />
                    }
                >
                    <Route
                        path="/admin"
                        element={<AdminLayout />}
                    >
                        <Route
                            index
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="categories"
                            element={<Categories />}
                        />

                        <Route
                            path="quizzes"
                            element={<Quizzes />}
                        />

                        <Route
                            path="questions"
                            element={<Questions />}
                        />

                        <Route
                            path="students"
                            element={<Students />}
                        />

                        <Route
                            path="reports"
                            element={<Reports />}
                        />
                    </Route>
                </Route>


                {/* =========================
                    STUDENT ROUTES
                ========================== */}

                <Route
                    element={
                        <ProtectedRoute role="STUDENT" />
                    }
                >
                    <Route
                        path="/student"
                        element={<StudentLayout />}
                    >
                        {/* /student */}
                        <Route
                            index
                            element={<StudentDashboard />}
                        />
                        <Route
    path="quizzes"
    element={<StudentQuizzes />}
/>
                    
                        {/* /student/attempts */}
                        <Route
                            path="attempts"
                            element={<Attempts />}
                        />
                            
                        {/* /student/quiz/:quizId */}
                        <Route
                            path="quiz/:quizId"
                            element={<QuizDetails />}
                        />

                        {/* /student/quiz/:quizId/attempt/:attemptId */}
                        <Route
                            path="quiz/:quizId/attempt/:attemptId"
                            element={<QuizAttempt />}
                        />

                        {/* /student/result/:attemptId */}
                        <Route
                            path="result/:attemptId"
                            element={<Result />}
                        />
                    </Route>
                </Route>


                {/* =========================
                    UNKNOWN ROUTE
                ========================== */}

                <Route
                    path="*"
                    element={<Login />}
                />

            </Routes>
        </BrowserRouter>
    );
}