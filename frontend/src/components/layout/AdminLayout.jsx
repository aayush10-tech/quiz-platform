import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout() {

    useEffect(() => {

        document.title = "Quiz Platform - Admin";

    }, []);

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex-1 flex flex-col">

                <Navbar />

                <main className="flex-1 p-8 overflow-auto">

                    <Outlet />

                </main>

            </div>

        </div>

    );

}