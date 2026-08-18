import { useEffect, useState } from "react";

import { getAdminDashboard } from "../services/dashboard.service";

import toast from "react-hot-toast";

export default function useDashboard() {

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {

        try {

            setLoading(true);

            const response = await getAdminDashboard();

            setDashboard(response.data);

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Failed to load dashboard"

            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchDashboard();

    }, []);

    return {

        dashboard,

        loading,

        refresh: fetchDashboard

    };

}