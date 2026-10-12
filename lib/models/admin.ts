import { Schema, model, models } from "mongoose";

const adminSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin"], default: "admin" },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Admin = models.Admin || model("Admin", adminSchema);
