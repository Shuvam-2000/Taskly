import Company from "../models/company.model.js";
import Admin from "../models/admin.model.js"
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

// register new admin
export const registerNewAdmin = async (req,res) => {
    try {
        const companyId = req.compnay?.companyId;

        if(!companyId) return res.status(404).json({
            message: "Company Id Not Found",
            success: false
        });

        const { name, email, password } = req.body

        if(!name || !email || !password) return res.status(400).json({
            message: "All Fields Are Required",
            success: false
        })

        // check if admin already exists
        const adminAlreadyExists = await Admin.findOne(( email ))

        if(!adminAlreadyExists) return res.status(400).json({
            message: "Admin Already Exists",
            success: false
        })

        // regsiter new admin
        const newAdmin = await Admin.create({
            name,
            email,
            password
        })

        rs.status(201).json({
            message: "Admin Registered SuccessFully",
            success: false,
            admin: newAdmin
        })
        
    } catch (error) {
        console.error("Error Registering Admin" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })  
    }
}

// update info of any regsiterd admin
export const updateAdminInfo = async (req,res) => {
    try {
        const companyId = req.company?.companyId;

        if(!companyId) return res.status(404).json({
            message: "Company Id Not Found",
            success: false
        })

        // get adminId
        const { adminId } = req.parmas;
        const { name, email, password} = req.body

        // check if adminId is fetched
        if(!adminId) return res.status(400).json({
            message: "Admin Id is Required",
            success: false
        })

        // find the admin
        const admin = await Admin.findById(adminId);
        if(!admin) return res.status(404).json({
            message: "Admin Not Found",
            success: false
        })

        // update fields only if they are provided
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (password) admin.password = password;

        // save updated admin
        const updatedAdmin = await admin.save();

        res.status(200).json({
            message: "Admin updated successfully",
            success: true,
            admin: updatedAdmin
        });
    } catch (error) {
        console.error("Error Updating Admin Info" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })  
    }
}

// get all registered admin
export const getAllRegisteredAdmin = async (req,res) => {
    try {
        const companyId = req.company?.companyId;

        if(!companyId) return res.status(404).json({
            message: "Company Id not Found",
            success: false
        })

        // get all admin regsitered
        const getAllAdmin = await Admin.find({})

        if(getAllAdmin.length === 0) return res.status(400).json({
            message: "No Admin Registered",
            success: false
        })

        res.status(200).json({
            message: "Here Are All the Regsitered Admin",
            success: true,
            admin: getAllAdmin
        })
    } catch (error) {
        console.error("Error Getting All Admin" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        }) 
    }
}