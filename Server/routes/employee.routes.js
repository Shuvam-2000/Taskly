import express from "express";
import {
  employeeLogin,
  getAllAssignedTask,
  updateTaskStatus,
} from "../controllers/employee.controller.js";
import { isEmployeeLoggedIn } from "../middleware/employee.middleware.js";

const router = express.Router();

// employee login
router.post("/employee-login", employeeLogin);

// get assigned tasks
router.get("/my-task", isEmployeeLoggedIn, getAllAssignedTask);

// update task status
router.put("/update-status", isEmployeeLoggedIn, updateTaskStatus);

export default router;
