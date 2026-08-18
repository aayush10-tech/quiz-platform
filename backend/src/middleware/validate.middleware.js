const validate = (schema) => {

    return (req, res, next) => {

        try {

            const data =
                schema.parse(req.body);

            req.validatedData = data;

            next();

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation failed",

                errors:
                    error.issues || []

            });

        }

    };

};

export default validate;