import { Schema, model, models } from "mongoose";

const aiAssistUsageSchema = new Schema(
  {
    sessionHash: { type: String, required: true, unique: true, index: true },
    counts: {
      bootcampReason: { type: Number, required: true, default: 0, min: 0 },
      bootcampCurrentWork: { type: Number, required: true, default: 0, min: 0 },
      bootcampChallenge: { type: Number, required: true, default: 0, min: 0 },
    },
    total: { type: Number, required: true, default: 0, min: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

aiAssistUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AiAssistUsage = models.AiAssistUsage || model("AiAssistUsage", aiAssistUsageSchema);
