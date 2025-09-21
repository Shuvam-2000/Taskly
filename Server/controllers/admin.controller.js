import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js'
import { configDotenv } from 'dotenv';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';

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
          companyId: admin.companyId
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
                companyId: admin.companyId
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

// register new employee
export const registerNewEmployee = async (req, res) => {
  try {
    const adminId = req.admin?.adminId;

    if (!adminId) {
      return res.status(404).json({
        message: "Admin Id Not Found",
        success: false,
      });
    }

    // fetch admin details to get companyId
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        message: "Admin Not Found",
        success: false,
      });
    }

    const companyId = admin.companyId;

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // check for existing employee
    const ifEmployeeExists = await Employee.findOne({ email });
    if (ifEmployeeExists) {
      return res.status(400).json({
        message: "Employee Already Exists",
        success: false,
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create employee
    const employee = new Employee({
      name,
      email,
      password: hashedPassword,
      role,
      companyId,
      adminId,
    });

    await employee.save();

    res.status(201).json({
      message: "Employee Registered Successfully",
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Error Registering Employee", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// get all registered employees
export const getAllEmployees = async (req,res) => {
    try {
       const adminId = req.admin?.adminId;

        if(!adminId) return res.status(404).json({
            message: "Company Id not Found",
            success: false
        })

        // get all employees regsitered
        const getAllEmployee = await Employee.find({})

        if(getAllEmployee.length === 0) return res.status(400).json({
            message: "No Employee Registered",
            success: false
        })

        res.status(200).json({
            message: "Here Are All the Regsitered Admin",
            success: true,
            employee: getAllEmployee
        })
    } catch (error) {
        console.error("Error Getting All Employee" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        }) 
    }
}

// get assigned project for admin
export const getAssignedProject = async (req,res) => {
  try {
      const adminId = req.admin?.adminId;

      if(!adminId) return res.status(404).json({
          message: "Company Id not Found",
          success: false
      })

      // fetch projects assigned to the admin
      const projects = await Project.find({ adminId })
      .populate("companyId", "name email")
      .sort({ createdAt: -1 })

      if(!projects.length) return res.status(404).json({
        message: "No Projects Assigned",
        success: false
      })

      res.status(200).json({
        message: "Assigned Projects Fetched Successfully",
        success: true,
        count: projects.length,
        project: projects
      });

  } catch (error) {
      console.error("Error Getting Assigned Projects" , error.message)
      res.status(500).json({
            message: 'Internal Server Error',
            success: false
      }) 
  }
}

// create task for assigned project and assign the task to a employee
export const createTaskForAssignProject = async (req,res) => {
  try {
    const { title, 
            description, 
            priority, 
            dueDate, 
            projectId, 
            assignedTo } = req.body

    // fetching the companyId and the adminId
    const companyId = req.admin?.companyId
    const adminId = req.admin?.adminId
    
    if (!title || !projectId) return res.status(400).json({
      message: "Title and ProjectId are required",
      success: false
    })

    if(!companyId || !adminId) return res.status(403).json({
      message: "Company Id and Admin Id is missing",
      success: false
    })

    // check if project exists and belong to the same company
    const project = await Project.findOne({ _id: projectId, companyId })
    if(!project) return res.status(404).json({
      message: "Project Not Found",
      success: false
    })

    // validate employee
    let employee = null;
    if (assignedTo) {
      employee = await Employee.findOne({ _id: assignedTo, companyId });
      if (!employee) {
        return res.status(404).json({
          message: "Employee not found or not part of this company",
          success: false,
        });
      }
    }

    // check if employee already has a task nd its not completed
    const existingTask = await Task.findOne({
      assignedTo,
      status: { $ne: "done" },
    })

    if(existingTask) return res.status(400).json({
      message: "This employee already has an assigned task",
      success: false
    })

    // create new task
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      projectId,
      companyId,
      adminId,
      assignedTo: employee?._id || null,
    });

    res.status(201).json({
      message: "Task created successfully",
      success: true,
      task: task
    });

  } catch (error) {
    console.error("Error Creating Task For Assign Project" , error.message)
    res.status(500).json({
      message: 'Internal Server Error',
      success: false
    }) 
  }
}