import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true })

// validate employee email domain
employeeSchema.pre("save", async function (next) {
  const Company = mongoose.model("company");
  const company = await Company.findById(this.companyId);

  if (company && !this.email.endsWith(`@${company.domain}`)) {
    throw new Error(`Employee email must belong to @${company.domain}`);
  }
  next();
});

const Employee = mongoose.model("employee", employeeSchema);

export default Employee;