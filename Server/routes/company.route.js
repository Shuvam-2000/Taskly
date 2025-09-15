import express from "express";
import {
  getAllRegisteredAdmin,
  loginCompany,
  registerNewAdmin,
  registerNewCompany,
  updateAdminInfo,
} from "../controllers/company.controller.js";
import { isCompanLoggedIn } from "../middleware/company.middleware";

const router = express.Router();

// register new company
router.post("/register", registerNewCompany);

// login company
router.post("/company-login", loginCompany);

// regsiter new admin
router.post("/regsiter-admin", isCompanLoggedIn, registerNewAdmin);

// update admin info
router.put("/update-admin", isCompanLoggedIn, updateAdminInfo);

// get registered admin
router.get("/get-admin", isCompanLoggedIn, getAllRegisteredAdmin);

export default router;
