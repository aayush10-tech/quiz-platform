import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import morgan from "morgan";

const PORT = process.env.PORT || 5000;

app.use(
    morgan("combined")
);

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});