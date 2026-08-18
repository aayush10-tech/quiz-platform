import ApiError from "../utils/ApiError.js";

const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(
        `${req.method} ${req.originalUrl}`,
        err
    );


    if (err instanceof ApiError) {

        return res.status(
            err.statusCode
        ).json({

            success: false,

            message:
                err.message

        });

    }


    // Prisma known request errors

    if (
        err?.code === "P2002"
    ) {

        return res.status(409).json({

            success: false,

            message:
                "A record with this value already exists."

        });

    }


    if (
        err?.code === "P2025"
    ) {

        return res.status(404).json({

            success: false,

            message:
                "Requested record was not found."

        });

    }


    return res.status(500).json({

        success: false,

        message:
            "Internal Server Error"

    });

};

export default errorHandler;