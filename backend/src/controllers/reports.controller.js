import {
    getAdminReportsService
} from "../services/reports.service.js";


export const getAdminReports = async (req, res) => {

    try {

        const reports =
            await getAdminReportsService();


        return res.status(200).json({

            success: true,

            statusCode: 200,

            message: "Reports loaded successfully",

            data: reports

        });

    } catch (error) {

        console.error(
            "Reports Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to load reports"

        });

    }

};