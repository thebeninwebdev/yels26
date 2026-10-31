import { Schema, model, models } from "mongoose";

const eventSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, enum: ["event"], default: "event" },
    eventCapacity: { type: Number, required: true, min: 1, max: 10_000, default: 70 },
    selectionFinalized: { type: Boolean, required: true, default: false },
    selectionFinalizedAt: Date,
    selectionFinalizedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    selectionUpdatedAt: Date,
    selectionEmailsStartedAt: Date,
    selectionEmailsStartedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    selectionEmailsCompletedAt: Date,
  },
  { timestamps: true },
);

export const EventSettings = models.EventSettings || model("EventSettings", eventSettingsSchema);
