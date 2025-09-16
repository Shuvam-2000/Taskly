import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
    },
  },
  { timestamps: true }
);

// validate the email domain
adminSchema.pre("save", async function (next) {
  const Company = mongoose.model("company");
  const company = await Company.findById(this.companyId);

  if (company && !this.email.endsWith(`@${company.domain}`)) {
    throw new Error(`Admin email must belong to @${company.domain}`);
  }

  next();
});

const Admin = mongoose.model("admin", adminSchema);

export default Admin;
