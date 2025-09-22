import Employee from "../models/employee.model.js";
import Task from "../models/task.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

// employee login
export const employeeLogin = async (req,res) => {
    try {
        const { email , password } = req.body

        if(!email || !password) return res.status(404).json({
            message: "All Fields Are Required",
            success: false
        })

        // find admin by email
        const employee = await Employee.findOne({ email });
        if(!employee) return res.status(400).json({
            message: "Invalid Credentials",
            sucess: false
        })

        const isPasswordMatch = await bcrypt.compare(password, employee.password);

        if(!isPasswordMatch) return res.status(400).json({
            message: "Inavalid Credentials",
            success: false
        })

        const token = jwt.sign(
        { 
          employeeId: employee._id, 
          email: employee.email, 
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
        );

         res.status(200).json({
            message: "Login Successful",
            success: true,
            token,
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
            },
         });
    } catch (error) {
        console.error("Error Employee Login" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        }) 
    }
}

// get all assigned task
export const getAllAssignedTask = async (req,res) => {
    try {
        const employeeId = req.employee?.employeeId

        if(!employeeId) return res.status(400).json({
            message: "Employee Id is required",
            success: false
        })

        // find all tasks assigned to this tasks
        const tasks = await Task.find({ assignedTo: employeeId })
        .populate("projectId", "name description")
        .populate("adminId", "name email")

        if(tasks.length === 0) return res.status(404).json({
            message: "No tasks has been assigned",
            success: false
        })

        res.status(200).json({
            message: "Assigned tasks fetched successfully",
            success: true,
            task: tasks,
        });
    } catch (error) {
        console.error("Error Getting Assigned Task" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })
    }
}

// update task status
export const updateTaskStatus = async (req,res) => {
    try {
        const employeeId = req.employee?.employeeId;

        if(!employeeId) return res.status(403).json({
            message: "Employee Id Not Found",
            success: false
        })

        // fetch taskId and status from the frontend
        const { taskId, status } = req.body

        if(!taskId || !status) return res.status(400).json({
            message: "TasK Id and Status are required",
            success: false
        })

        // validate task status
        const allowedStatuses = ["todo", "in-progress", "done"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${allowedStatuses.join(", ")}`,
                success: false,
            });
        }

        // find task and ensure it is assigned to this employee
        const task = await Task.findOne({ _id: taskId, assignedTo: employeeId });
        if (!task) {
        return res.status(404).json({
            message: "Task not found or not assigned to you",
            success: false,
        });
        }

        // update status
        task.status = status;
        const updatedTask = await task.save();

        res.status(200).json({
            message: "Task status updated successfully",
            success: true,
            task: updatedTask,
        });
    } catch (error) {
        console.error("Error Updating Task Status" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        }) 
    }
}

// get task details for employee
export const getTaskDetailsForEmployee = async (req,res) => {
    try {
        const employeeId = req.employee?.employeeId;

        if(!employeeId) return res.status(403).json({
            message: "Employee Id Not Found",
            success: false
        })

        const { taskId } = req.params;

        if(!taskId) return res.status(400).json({
            message: "Task Id is required",
            success: false
        })

        // fetch task
        const task = await Task.findOne({ _id: taskId })
            .populate("projectId", "projectName projectDescription")

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Task details fetched successfully",
            success: true,
            task: task
        });
    } catch (error) {
        console.error("Error Getting Task Details For Employee" , error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        }) 
    }
}