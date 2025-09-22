import express from "express";
import {
  adminLogin,
  createTaskForAssignProject,
  getAllEmployees,
  getAssignedProject,
  getEmployeesTaskInfoAndStatus,
  getTaskDetailsForAdmin,
  registerNewEmployee
} from "../controllers/admin.controller.js";
import { isAdminLoggedIn } from "../middleware/admin.middleware.js";

const router = express.Router();

// admin login
router.post("/admin-login", adminLogin);

// register employee
router.post("/register-employee", isAdminLoggedIn, registerNewEmployee);

// get all regsitered employees
router.get("/get-employee", isAdminLoggedIn, getAllEmployees);

// get assigned projects
router.get("/get-assigned", isAdminLoggedIn, getAssignedProject);

// create task and assign it to a employee
router.post("/assign-task", isAdminLoggedIn, createTaskForAssignProject);

// get employee info , task assigned and the status of the task
router.get("/get-assignedtask", isAdminLoggedIn, getEmployeesTaskInfoAndStatus);

// get task detials for admin
router.get("/:taskId", isAdminLoggedIn, getTaskDetailsForAdmin);

export default router;
