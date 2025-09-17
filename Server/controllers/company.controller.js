import Company from "../models/company.model.js";
import Admin from "../models/admin.model.js";
import Project from "../models/project.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { configDotenv } from "dotenv";
import Employee from "../models/employee.model.js";

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

        if(ifCompanyExists) return res.status(404).json({
            message: "Company Already Exists",
            success: false
        })

        // check if domain is not same
        const checkCompanyDomain = await Company.findOne({ domain })

        if(checkCompanyDomain) return res.status(404).json({
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
            domain
        })

        // save to the db
        await company.save();

        res.status(201).json({
            message: "Company Registration Suceessful",
            success: true,
            company: company
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
          domain: company.domain
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
                domain: company.domain
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
export const registerNewAdmin = async (req, res) => {
  try {
    const companyId = req.company?.companyId;
    const domain = req.company?.domain;

    console.log(domain)
    console.log(companyId)

    if (!companyId || !domain) {
      return res.status(404).json({
        message: "Company Id or Domain Not Found",
        success: false,
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All Fields Are Required",
        success: false,
      });
    }

    // ensure email belongs to company domain
    if (!email.endsWith(`@${domain}`)) {
      return res.status(400).json({
        message: `Admin email must belong to @${domain}`,
        success: false,
      });
    }

    // check if admin already exists
    const adminAlreadyExists = await Admin.findOne({ email });

    if (adminAlreadyExists) {
      return res.status(400).json({
        message: "Admin Already Exists",
        success: false,
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // register new admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      companyId,
      domain, // optional
    });

    return res.status(201).json({
      message: "Admin Registered Successfully",
      success: true,
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Error Registering Admin:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

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

// get all registered employee
export const getAllEmployee = async (req,res) => {
  try {
      const companyId = req.company?.companyId

      if(!companyId) return res.status(404).json({
        message: "Company Id Not Found",
        success: false
      })

      // get all employee for company
      const employee = await Employee.findOne({})

      if(employee.length === 0) return res.status(400).json({
            message: "No Employee Registered",
            success: false
      })

      res.status(200).json({
            message: "Here Are All the Regsitered Employee",
            success: true,
            employee: employee
      })
  } catch (error) {
      console.error("Error Getting All Employee" , error.message)
      res.status(500).json({
            message: 'Internal Server Error',
            success: false
      }) 
  }
}

// create and assign project to a admin
export const createAndAssignProject = async (req,res) => {
  try {
      const companyId = req.company?.companyId;

      if(!companyId) return res.status(404).json({
          message: "Company Id Not Found",
          success: false
      })

      // fetch fields from the frontend
      const { projectName, projectDescription, adminId } = req.body;

      // check if all fields are given
      if(!projectName || !projectDescription || !adminId) return res.status(404).json({
        message: "All Fields Required",
        success: false
      })

      // verify that the admin belongs to the particular company
      const admin = await Admin.findOne({ _id: adminId, companyId });
      if (!admin) {
        return res.status(404).json({
          message: "Admin Not Found in This Company",
          success: false,
        });
      }

      // create the project
      const project = new Project({
        projectName,
        projectDescription,
        companyId,
        adminId
      })

      // save the project to the db
      await project.save();

      res.status(201).json({
        message: "Project Created and Assigned SuccessFully",
        success: true,
        project: project
      })

  } catch (error) {
      console.error("Error Creating Project" , error.message)
      res.status(500).json({
          message: 'Internal Server Error',
          success: false
      }) 
  }
}

// get all projects and assigned admin to the project
export const getAllProjectCreated = async (req,res) => {
  try {
     const companyId = req.company.companyId;

     if(!companyId) return res.status(404).json({
        message: 'Company Id Not Found',
        success: false
      })

      // fetch all projects for this company with the assigned admin
      const projects = await Project.find({ companyId })
      .populate("adminId", "name email") 
      .sort({ createdAt: -1 })

      if(!projects.length) return res.status(404).json({
        message: "No Projects Found",
        success: false
      })

      res.status(200).json({
        message: "Projects Fetched SuccessFully",
        success: true,
        count: projects.length,
        project: projects
      })
  } catch (error) {
    console.error("Error Getting All Project" , error.message)
    res.status(500).json({
          message: 'Internal Server Error',
          success: false
    }) 
  }
}