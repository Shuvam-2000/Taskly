import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import { configDotenv } from 'dotenv';

// load environment variables
configDotenv();

// admin login
export const adminLogin = async (req,res) => {
    try {
        const { email, password } = req.body

        if(!email || !password) return res.status(404).json({
            message: "All Fields Are Required",
            success: false
        })

        // find admin by email
        const admin = await Admin.findOne({ email });
        if(!admin) return res.status(400).json({
            message: "Invalid Credentials",
            sucess: false
        })

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if(!isPasswordMatch) return res.status(400).json({
            message: "Inavalid Credentials",
            success: false
        })

        const token = jwt.sign(
        { 
          adminId: admin._id, 
          email: admin.email, 
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
        );

         res.status(200).json({
            message: "Login Successful",
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
         });
        
    } catch (error) {
        console.error("Error Admin Login" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })  
    }
}