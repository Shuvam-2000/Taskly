import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "task",
    required: true,
  },
  userType: {
    type: String,
    enum: ["Admin", "Employee"],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
});

const Comment = mongoose.model("comment", commentSchema);

export default Comment;
