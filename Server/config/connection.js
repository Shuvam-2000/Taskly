import mongoose from "mongoose";
import { configDotenv } from 'dotenv';

// Load environment variables
configDotenv();

// initialize db connection with environment variables
const mongo_url = process.env.MONGO_URL;

// connecting to the database
mongoose.connect(mongo_url)
.then(() => console.log("MongoDb Connected")).catch((err) =>{
    console.log("Connection Failed", err)
})