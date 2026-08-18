import {
    getLeaderboardService
} from "../services/leaderboard.service.js";

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await getLeaderboardService();

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Leaderboard fetched successfully",
            data: {
                leaderboard
            }
        });

    } catch (error) {
        console.error("Leaderboard Error:", error);

        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Failed to fetch leaderboard"
        });
    }
};