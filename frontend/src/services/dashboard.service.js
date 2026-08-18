import api from "../api/axios";

export const getAdminDashboard = async () => {

    const response = await api.get("/dashboard/admin");

    return response.data;

};