const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRouter = require("./routers/authRouter");

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.log(`Error connecting to DB : ${err}`);
    });

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
    res.json({ message: "Hello from NodeJS Server" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port {${process.env.PORT}}`);
});
