import express from "express";
import {
  createAndAssignProject,
  getAllEmployee,
  getAllProjectCreated,
  getAllRegisteredAdmin,
  loginCompany,
  registerNewAdmin,
  registerNewCompany,
} from "../controllers/company.controller.js";
import { isCompanyLoggedIn } from "../middleware/company.middleware.js";

const router = express.Router();

// register new company
router.post("/register", registerNewCompany);

// login company
router.post("/company-login", loginCompany);

// regsiter new admin
router.post("/regsiter-admin", isCompanyLoggedIn, registerNewAdmin);

// get registered admin
router.get("/get-admin", isCompanyLoggedIn, getAllRegisteredAdmin);

// get all registered employee
router.get("/fetch-employee", isCompanyLoggedIn, getAllEmployee);

// create and assign project to admin
router.post("/create-project", isCompanyLoggedIn, createAndAssignProject);

// get all project created and the assigned admin details
router.get("/get-project", isCompanyLoggedIn, getAllProjectCreated);

export default router;
