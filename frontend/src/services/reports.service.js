import api from "../api/axios";


export const getAdminReports = async () => {

    const response =
        await api.get("/reports/admin");


    return response.data;

};