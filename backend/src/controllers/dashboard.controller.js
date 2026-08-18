import asyncHandler from "../middleware/async.middleware.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getAdminDashboardService,
    getStudentDashboardService
} from "../services/dashboard.service.js";

export const getAdminDashboard = asyncHandler(async (req, res) => {

    const dashboard = await getAdminDashboardService();

    return res.json(
        new ApiResponse(
            200,
            dashboard,
            "Admin dashboard fetched successfully"
        )
    );

});

export const getStudentDashboard = asyncHandler(async (req, res) => {

    const dashboard = await getStudentDashboardService(
        req.user.id
    );

    return res.json(
        new ApiResponse(
            200,
            dashboard,
            "Student dashboard fetched successfully"
        )
    );

});