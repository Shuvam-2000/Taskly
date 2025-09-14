import Company from "../models/company.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { configDotenv } from "dotenv";

// load enviroment variables
configDotenv();

// regsiter a new company
export const registerNewCompany = async (req,res) => {
    try {
        const { name , domain, email, password } = req.body;

        if(!name || 
            !domain || 
            !email || 
            !password) return res.status(400).json({
            message: "All Fields Are Required",
            success: false
        })

        // check if company already exists
        const ifCompanyExists = await Company.findOne({ email, name })

        if(!ifCompanyExists) return res.status(404).json({
            message: "Company Already Exists",
            success: false
        })

        // check if domain is not same
        const checkCompanyDomain = await Company.findOne({ domain })

        if(!checkCompanyDomain) return res.status(404).json({
            message: "Domain Already In Use",
            sucess: false
        })

        // hash the password
        const hashedPassword = await bcrypt.hash(password,10);

        // register the new company
        const company = new Company({
            name,
            email,
            password: hashedPassword,
            domain,
            password
        })

        // save to the db
        await company.save();

        res.status(201).json({
            message: "Company Registration Suceessful",
            success: true,
            customer: customer
        })
        
    } catch (error) {
        console.error("Error Registering Company" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })
    }
}

// login for company
export const loginCompany = async (req,res) => {
    try {
        const { email, password } = req.body

        // check if all fields are given
        if(!email || !password) return res.status(404).json({
            message: "All Fields are Required",
            success: false
        })

        // find company by email
        const company = await Company.findOne({ email });
        if(!company) return res.status(400).json({
            message: "Invalid Credentials",
            sucess: false
        })

        const isPasswordMatch = await bcrypt.compare(password, company.password);

        if(!isPasswordMatch) return res.status(400).json({
            message: "Inavalid Credentials",
            success: false
        })

        const token = jwt.sign(
        { 
          companyId: company._id, 
          email: company.email, 
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
        );

         res.status(200).json({
            message: "Login Successful",
            success: true,
            token,
            company: {
                id: company._id,
                name: company.name,
                email: company.email,
            },
         });
        
    } catch (error) {
        console.error("Error Company Login" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })  
    }
}