import express from "express";
import {
  adminLogin,
  getAllEmployees,
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

export default router;
