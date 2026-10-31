import { Schema, model, models } from "mongoose";

const bootcampApplicationSchema = new Schema(
  {
    reason: String,
    primaryInterest: String,
    primaryInterestOther: String,
    currentWork: String,
    challenge: String,
    previousProgramme: String,
    previousProgrammeDetails: String,
    availableBothDays: String,
  },
  { _id: false },
);

const attendeeSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, phone: { type: String, required: true, trim: true },
    ageRange: { type: String, required: true }, gender: { type: String, required: true }, participantType: { type: String, required: true }, participantTypeOther: String,
    organisation: String, roleOrCourse: String, state: { type: String, required: true }, cityOrLga: { type: String, required: true },
    interests: { type: [String], required: true }, interestOther: String, expectedOutcomes: { type: [String], required: true },
    hasDisability: { type: String, required: true }, accessibilitySupport: String, heardAbout: { type: String, required: true }, heardAboutOther: String,
    bootcampApplied: { type: Boolean, required: true }, bootcampApplication: bootcampApplicationSchema,
    registrationStatus: { type: String, enum: ["registered", "cancelled"], default: "registered" },
    selectionStatus: { type: String, enum: ["pending", "selected", "waitlisted", "not_selected"], default: "pending", required: true },
    selectionDecision: {
      decidedAt: Date,
      decidedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    },
    bootcampStatus: { type: String, enum: ["not_applied", "pending", "approved", "rejected", "waitlisted"], required: true },
    bootcampDecision: {
      decidedAt: Date,
      decidedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    },
    bootcampSelectionEmail: {
      status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
      sentAt: Date,
      resendEmailId: String,
      outcome: { type: String, enum: ["approved", "rejected", "waitlisted"] },
      idempotencyKey: String,
      attempts: Number,
      lastAttemptAt: Date,
      lastError: String,
    },
    consent: { type: Boolean, required: true }, consentedAt: { type: Date, default: Date.now },
    marketingConsent: { type: Boolean, default: false }, registrationId: { type: String, required: true, unique: true },
    ticketEmail: {
      status: { type: String, enum: ["pending", "sending", "sent", "failed"], default: "pending" },
      sentAt: Date,
      resendEmailId: String,
      attempts: Number,
      lastAttemptAt: Date,
      claimedAt: Date,
      bootcampStatusIncluded: { type: String, enum: ["not_applied", "pending", "approved", "rejected", "waitlisted"] },
      lastError: String,
    },
    registrationEmail: {
      status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
      sentAt: Date,
      resendEmailId: String,
      lastError: String,
    },
    checkIn: {
      status: { type: String, enum: ["not_checked_in", "checked_in"], default: "not_checked_in" },
      checkedInAt: Date,
    },
  },
  { timestamps: true },
);

attendeeSchema.index({ registrationStatus: 1, selectionStatus: 1, "ticketEmail.status": 1 });

export const Attendee = models.Attendee || model("Attendee", attendeeSchema);
