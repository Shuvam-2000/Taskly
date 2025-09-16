import express from "express";
import {
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

export default router;
