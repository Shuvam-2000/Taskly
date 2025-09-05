import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import "./config/connection.js"

configDotenv();

const app = express();

// initlaize the port
const PORT = process.env.PORT || 8001;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());

// test route
app.get('/', (req,res) => {
    res.send("Hello Server Is Running")
});

// run the server
app.listen(PORT, () => console.log(`Server runing on PORT: ${PORT}`));