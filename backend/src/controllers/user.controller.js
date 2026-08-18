import {
    getStudentsService,
    getStudentByIdService,
    updateStudentStatusService,
    deleteStudentService
} from "../services/user.service.js";


export const adminDashboard = async (req, res) => {

    return res.json({
        success: true,
        message: "Welcome Admin",
        admin: req.user
    });

};


export const getStudents = async (req, res) => {

    try {

        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(req.query.limit) || 10,
                1
            ),
            100
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const status =
            typeof req.query.status === "string"
                ? req.query.status.trim().toUpperCase()
                : "";

        const data = await getStudentsService({
            page,
            limit,
            search,
            status
        });

        return res.json({
            success: true,
            statusCode: 200,
            message: "Students fetched successfully",
            data
        });

    } catch (error) {

        console.error("GET STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch students"
        });

    }

};


export const getStudentById = async (req, res) => {

    try {

        const studentId = Number(req.params.id);

        if (!Number.isInteger(studentId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });

        }

        const student =
            await getStudentByIdService(studentId);

        return res.json({
            success: true,
            statusCode: 200,
            message: "Student fetched successfully",
            data: student
        });

    } catch (error) {

        console.error("GET STUDENT ERROR:", error);

        return res.status(404).json({
            success: false,
            message: error.message || "Student not found"
        });

    }

};


export const updateStudentStatus = async (req, res) => {

    try {

        const studentId = Number(req.params.id);

        const { status } = req.body;

        if (!Number.isInteger(studentId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });

        }

        const student =
            await updateStudentStatusService(
                studentId,
                status
            );

        return res.json({
            success: true,
            statusCode: 200,
            message: `Student ${status === "ACTIVE" ? "activated" : "deactivated"} successfully`,
            data: student
        });

    } catch (error) {

        console.error(
            "UPDATE STUDENT STATUS ERROR:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};


export const deleteStudent = async (req, res) => {

    try {

        const studentId = Number(req.params.id);

        if (!Number.isInteger(studentId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });

        }

        await deleteStudentService(studentId);

        return res.json({
            success: true,
            statusCode: 200,
            message: "Student deleted successfully"
        });

    } catch (error) {

        console.error("DELETE STUDENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};