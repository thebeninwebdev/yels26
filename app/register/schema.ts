import { z } from "zod";

const requiredText = (label: string, min = 2) =>
  z.string().trim().min(min, `${label} is required.`);

export const registrationSchema = z
  .object({
    fullName: requiredText("Full name"),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s()-]{6,19}$/, "Enter a valid WhatsApp number."),
    ageRange: z.enum(["under_18", "18_24", "25_30", "31_35", "36_plus"]),
    gender: z.enum(["male", "female", "prefer_not_to_say"]),
    participantType: z.enum([
      "student",
      "recent_graduate",
      "young_professional",
      "entrepreneur",
      "private_sector",
      "government",
      "ngo",
      "other",
    ]),
    participantTypeOther: z.string().trim().max(120).optional().or(z.literal("")),
    organisation: z.string().trim().max(180).optional().or(z.literal("")),
    roleOrCourse: z.string().trim().max(180).optional().or(z.literal("")),
    state: requiredText("State"),
    cityOrLga: requiredText("City or LGA"),
    interests: z.array(z.string()).min(1, "Choose at least one interest."),
    interestOther: z.string().trim().max(120).optional().or(z.literal("")),
    expectedOutcomes: z
      .array(
        z.enum([
          "practical_leadership_skills",
          "career_business_opportunities",
          "build_connections",
          "grow_my_initiative",
          "inspiration_from_leaders",
        ]),
      )
      .min(1, "Select at least one outcome you hope to gain."),
    hasDisability: z.enum(["yes", "no", "prefer_not_to_say"]),
    accessibilitySupport: z.string().trim().max(500).optional().or(z.literal("")),
    heardAbout: z.enum([
      "instagram",
      "facebook",
      "x",
      "linkedin",
      "whatsapp",
      "friend",
      "school",
      "yali_network",
      "partner",
      "email",
      "other",
    ]),
    heardAboutOther: z.string().trim().max(120).optional().or(z.literal("")),
    bootcampApplied: z.enum(["yes", "no"]),
    bootcampReason: z.string().trim().max(1500).optional().or(z.literal("")),
    bootcampPrimaryInterest: z
      .enum([
        "entrepreneurship",
        "leadership",
        "career_development",
        "technology_innovation",
        "community_development",
        "public_service",
        "other",
      ])
      .optional(),
    bootcampPrimaryInterestOther: z.string().trim().max(120).optional().or(z.literal("")),
    bootcampCurrentWork: z.string().trim().max(1500).optional().or(z.literal("")),
    bootcampChallenge: z.string().trim().max(1500).optional().or(z.literal("")),
    previousProgramme: z.enum(["yes", "no"]).optional(),
    previousProgrammeDetails: z.string().trim().max(500).optional().or(z.literal("")),
    availableBothDays: z.enum(["yes", "no"]).optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please confirm your consent to continue." }),
    }),
    marketingConsent: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const addError = (condition: boolean, field: keyof typeof data, message: string) => {
      if (condition) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
    };
    addError(data.participantType === "other" && !data.participantTypeOther, "participantTypeOther", "Please describe your background.");
    addError(data.interests.includes("other") && !data.interestOther, "interestOther", "Please name your interest.");
    addError(data.heardAbout === "other" && !data.heardAboutOther, "heardAboutOther", "Please tell us how you heard about YELS.");
    if (data.bootcampApplied === "yes") {
      addError(!data.bootcampReason || data.bootcampReason.length < 10, "bootcampReason", "Please share why you are interested in the Bootcamp.");
      addError(!data.bootcampPrimaryInterest, "bootcampPrimaryInterest", "Choose your primary interest.");
      addError(data.bootcampPrimaryInterest === "other" && !data.bootcampPrimaryInterestOther, "bootcampPrimaryInterestOther", "Please name your primary interest.");
      addError(!data.bootcampCurrentWork || data.bootcampCurrentWork.length < 10, "bootcampCurrentWork", "Please share a brief response.");
      addError(!data.bootcampChallenge || data.bootcampChallenge.length < 10, "bootcampChallenge", "Please share the challenge you hope to address.");
      addError(!data.previousProgramme, "previousProgramme", "Select an answer.");
      addError(data.previousProgramme === "yes" && !data.previousProgrammeDetails, "previousProgrammeDetails", "Please name the programme.");
      addError(!data.availableBothDays, "availableBothDays", "Confirm your availability.");
    }
  });

export type RegistrationValues = z.input<typeof registrationSchema>;

export const defaultRegistrationValues: RegistrationValues = {
  fullName: "", email: "", phone: "", ageRange: "18_24", gender: "prefer_not_to_say",
  participantType: "student", participantTypeOther: "", organisation: "", roleOrCourse: "", state: "", cityOrLga: "",
  interests: [], interestOther: "", expectedOutcomes: [], hasDisability: "prefer_not_to_say", accessibilitySupport: "",
  heardAbout: "instagram", heardAboutOther: "", bootcampApplied: "no", bootcampReason: "",
  bootcampPrimaryInterest: undefined, bootcampPrimaryInterestOther: "", bootcampCurrentWork: "", bootcampChallenge: "",
  previousProgramme: undefined, previousProgrammeDetails: "", availableBothDays: undefined, consent: false as true, marketingConsent: false,
};
