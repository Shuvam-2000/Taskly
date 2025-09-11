import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        required: true
    },
    industry: {
        type: String
    },
    emailDomain: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true });

const Company = mongoose.model("company", companySchema);

export default Company;