"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { defaultRegistrationValues, registrationSchema, type RegistrationValues } from "./schema";
import { ease, useMotionPreference } from "../components/motion";

const steps = ["About you", "Background", "YELS", "Bootcamp", "Review"];
const optionSets = {
  ageRange: [["under_18", "Under 18"], ["18_24", "18–24"], ["25_30", "25–30"], ["31_35", "31–35"], ["36_plus", "36+"]],
  gender: [["male", "Male"], ["female", "Female"], ["prefer_not_to_say", "Prefer not to say"]],
  participantType: [["student", "Student"], ["recent_graduate", "Recent Graduate"], ["young_professional", "Young Professional"], ["entrepreneur", "Entrepreneur / Business Owner"], ["private_sector", "Private Sector Professional"], ["government", "Government / Public Sector"], ["ngo", "NGO / Civil Society"], ["other", "Other"]],
  interests: [["leadership", "Leadership"], ["entrepreneurship", "Entrepreneurship"], ["innovation", "Innovation"], ["technology", "Technology"], ["future_of_work", "Future of Work"], ["career_development", "Career Development"], ["networking", "Networking"], ["community_development", "Community Development"], ["other", "Other"]],
  heardAbout: [["instagram", "Instagram"], ["facebook", "Facebook"], ["x", "X / Twitter"], ["linkedin", "LinkedIn"], ["whatsapp", "WhatsApp"], ["friend", "Friend / Colleague"], ["school", "University / School"], ["yali_network", "YALI Network"], ["partner", "Partner Organisation"], ["email", "Email"], ["other", "Other"]],
  bootcampInterest: [["entrepreneurship", "Entrepreneurship"], ["leadership", "Leadership"], ["career_development", "Career Development"], ["technology_innovation", "Technology & Innovation"], ["community_development", "Community Development"], ["public_service", "Public Service"], ["other", "Other"]],
  expectedOutcomes: [["practical_leadership_skills", "Gain practical leadership skills and knowledge"], ["career_business_opportunities", "Learn about career, business, and future-of-work opportunities"], ["build_connections", "Build connections with other young leaders and professionals"], ["grow_my_initiative", "Gain ideas and tools to grow my career, business, or community initiative"], ["inspiration_from_leaders", "Be inspired by experienced leaders, entrepreneurs, and changemakers"]],
} as const;

type Option = readonly [string, string];
function ChoiceGrid({ name, options, value, onChange, error, multi = false, multiField = "interests", register }: { name: string; options: readonly Option[]; value?: string; onChange?: (value: string) => void; error?: string; multi?: boolean; multiField?: "interests" | "expectedOutcomes"; register?: ReturnType<typeof useForm<RegistrationValues>>["register"] }) {
  return <><div className={multiField === "expectedOutcomes" ? "registration-choices registration-outcomes" : "registration-choices"} role={multi ? "group" : "radiogroup"} aria-label={name}>
    {options.map(([id, label]) => <label className={multiField === "expectedOutcomes" ? "registration-choice registration-outcome-choice" : "registration-choice"} key={id}>
      <input type={multi ? "checkbox" : "radio"} value={id} checked={multi ? undefined : value === id} {...(multi ? register?.(multiField) : { name, onChange: () => onChange?.(id) })} />
      <span>{label}</span>
    </label>)}
  </div>{error && <p className="form-error" role="alert">{error}</p>}</>;
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return <label className="registration-field"><span>{label}</span>{hint && <small>{hint}</small>}{children}{error && <em className="form-error" role="alert">{error}</em>}</label>;
}

export function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState<{ fullName: string; registrationId: string; bootcampApplied: boolean } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reduced = useMotionPreference();
  const { control, register, setValue, trigger, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema), defaultValues: defaultRegistrationValues, mode: "onBlur",
  });
  const values = useWatch({ control, defaultValue: defaultRegistrationValues }) as RegistrationValues;
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);

  const next = async () => {
    const names = [
      ["fullName", "email", "phone", "ageRange", "gender"],
      ["participantType", "participantTypeOther", "state", "cityOrLga"],
      ["interests", "interestOther", "expectedOutcomes", "hasDisability", "heardAbout", "heardAboutOther"],
      values.bootcampApplied === "yes" ? ["bootcampApplied", "bootcampReason", "bootcampPrimaryInterest", "bootcampPrimaryInterestOther", "bootcampCurrentWork", "bootcampChallenge", "previousProgramme", "previousProgrammeDetails", "availableBothDays"] : ["bootcampApplied"],
    ][step];
    if (await trigger(names as (keyof RegistrationValues)[], { shouldFocus: true })) setStep((current) => Math.min(current + 1, 4));
  };
  const submit = async (data: RegistrationValues) => {
    setServerError("");
    const response = await fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) {
      if (result.fieldErrors) Object.entries(result.fieldErrors).forEach(([field, messages]) => setError(field as keyof RegistrationValues, { message: (messages as string[])[0] }));
      setServerError(result.error || "We couldn’t complete your registration. Please try again.");
      return;
    }
    setSuccess(result);
  };
  const radio = (name: keyof RegistrationValues) => ({ value: values[name] as string | undefined, onChange: (value: string) => setValue(name, value as never, { shouldValidate: true }) });
  const stepMotion = { initial: { opacity: 0, y: reduced ? 0 : 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: reduced ? 0 : -10 }, transition: { duration: reduced ? 0 : 0.32, ease } };

  if (success) return <section className="registration-success" aria-live="polite"><p className="section-label">REGISTRATION COMPLETE</p><h1>You&apos;re registered<br /><em>for YELS 2026.</em></h1><p>Thank you, {success.fullName}. Your summit registration has been confirmed.</p><div className="registration-id"><span>YOUR REGISTRATION ID</span><strong>{success.registrationId}</strong></div>{success.bootcampApplied && <p className="registration-bootcamp-note">Your Bootcamp application has been received and is currently under review.</p>}<Link className="registration" href="/">Back to YELS 2026 <span aria-hidden="true">↗</span></Link></section>;

  return <form className="registration-form" noValidate onSubmit={handleSubmit(submit, () => document.querySelector<HTMLElement>(".form-error")?.scrollIntoView({ behavior: "smooth", block: "center" }))}>
    <ol className="registration-progress" aria-label="Registration progress">{steps.map((label, index) => <li key={label} className={index === step ? "is-current" : index < step ? "is-complete" : ""}><span>0{index + 1}</span><b>{label}</b></li>)}</ol>
    <AnimatePresence mode="wait" initial={false}><motion.section key={step} {...stepMotion} className="registration-step" aria-labelledby="registration-heading">
      <p className="eyebrow">STEP 0{step + 1} / 05</p>
      {step === 0 && <><h1 id="registration-heading" tabIndex={-1} ref={heading}>Start with <em>you.</em></h1><p className="registration-intro">A few essentials to reserve your place at YELS 2026.</p><div className="registration-grid"><Field label="Full name" error={errors.fullName?.message}><input autoComplete="name" {...register("fullName")} /></Field><Field label="Email address" error={errors.email?.message}><input type="email" autoComplete="email" {...register("email")} /></Field><Field label="WhatsApp phone number" error={errors.phone?.message}><input type="tel" autoComplete="tel" {...register("phone")} /></Field></div><fieldset><legend>Age range</legend><ChoiceGrid name="age range" options={optionSets.ageRange} error={errors.ageRange?.message} {...radio("ageRange")} /></fieldset><fieldset><legend>Gender</legend><ChoiceGrid name="gender" options={optionSets.gender} error={errors.gender?.message} {...radio("gender")} /></fieldset></>}
      {step === 1 && <><h1 id="registration-heading" tabIndex={-1} ref={heading}>Your <em>background.</em></h1><p className="registration-intro">Tell us a little about where you are right now.</p><fieldset><legend>Which best describes you?</legend><ChoiceGrid name="participant type" options={optionSets.participantType} error={errors.participantType?.message} {...radio("participantType")} /></fieldset><AnimatePresence>{values.participantType === "other" && <motion.div {...stepMotion}><Field label="Please describe" error={errors.participantTypeOther?.message}><input {...register("participantTypeOther")} /></Field></motion.div>}</AnimatePresence><div className="registration-grid"><Field label="Institution, organisation, company or business" hint="Optional"><input {...register("organisation")} /></Field><Field label="Role, job title or course of study" hint="Optional"><input {...register("roleOrCourse")} /></Field><Field label="State" error={errors.state?.message}><input autoComplete="address-level1" {...register("state")} /></Field><Field label="City / LGA" error={errors.cityOrLga?.message}><input autoComplete="address-level2" {...register("cityOrLga")} /></Field></div></>}
      {step === 2 && <><h1 id="registration-heading" tabIndex={-1} ref={heading}>Your YELS <em>experience.</em></h1><p className="registration-intro">Choose what matters most, then tell us what you hope to take away.</p><fieldset><legend>Which areas are you most interested in? <small>Choose all that apply</small></legend><ChoiceGrid name="interests" options={optionSets.interests} multi register={register} error={errors.interests?.message} /></fieldset><AnimatePresence>{values.interests.includes("other") && <motion.div {...stepMotion}><Field label="Other interest" error={errors.interestOther?.message}><input {...register("interestOther")} /></Field></motion.div>}</AnimatePresence><fieldset><legend>What do you hope to gain from attending YELS 2026? <small>Select all that apply</small></legend><ChoiceGrid name="expected outcomes" options={optionSets.expectedOutcomes} multi multiField="expectedOutcomes" register={register} error={errors.expectedOutcomes?.message} /></fieldset><fieldset><legend>Are you a person with a disability?</legend><ChoiceGrid name="disability" options={[["yes", "Yes"], ["no", "No"], ["prefer_not_to_say", "Prefer not to say"]]} error={errors.hasDisability?.message} {...radio("hasDisability")} /></fieldset><AnimatePresence>{values.hasDisability === "yes" && <motion.div {...stepMotion}><Field label="Accessibility support or special arrangements" hint="Optional — only share what would make your experience more accessible."><textarea rows={3} {...register("accessibilitySupport")} /></Field></motion.div>}</AnimatePresence><fieldset><legend>How did you hear about YELS 2026?</legend><ChoiceGrid name="heard about" options={optionSets.heardAbout} error={errors.heardAbout?.message} {...radio("heardAbout")} /></fieldset><AnimatePresence>{values.heardAbout === "other" && <motion.div {...stepMotion}><Field label="Please tell us how" error={errors.heardAboutOther?.message}><input {...register("heardAboutOther")} /></Field></motion.div>}</AnimatePresence></>}
      {step === 3 && <><h1 id="registration-heading" tabIndex={-1} ref={heading}>Go deeper with the <em>Bootcamp.</em></h1><p className="registration-intro">The physical Bootcamp runs 8–9 December 2026, 9:00 AM–3:00 PM, in Benin City.</p><fieldset><legend>Would you like to apply for the limited YELS 2026 Bootcamp?</legend><ChoiceGrid name="bootcamp application" options={[["yes", "Yes, I would like to apply"], ["no", "No, summit registration only"]]} error={errors.bootcampApplied?.message} {...radio("bootcampApplied")} /></fieldset><AnimatePresence>{values.bootcampApplied === "yes" && <motion.div className="bootcamp-questions" {...stepMotion}><Field label="Why are you interested in participating in the YELS Bootcamp?" hint="Around 150 words or fewer." error={errors.bootcampReason?.message}><textarea rows={5} {...register("bootcampReason")} /></Field><fieldset><legend>Which area best describes your primary interest?</legend><ChoiceGrid name="bootcamp primary interest" options={optionSets.bootcampInterest} error={errors.bootcampPrimaryInterest?.message} {...radio("bootcampPrimaryInterest")} /></fieldset>{values.bootcampPrimaryInterest === "other" && <Field label="Please name your primary interest" error={errors.bootcampPrimaryInterestOther?.message}><input {...register("bootcampPrimaryInterestOther")} /></Field>}<Field label="Tell us briefly about something you are working on, building, leading or hoping to start." error={errors.bootcampCurrentWork?.message}><textarea rows={4} {...register("bootcampCurrentWork")} /></Field><Field label="What challenge are you hoping the Bootcamp will help you address?" error={errors.bootcampChallenge?.message}><textarea rows={4} {...register("bootcampChallenge")} /></Field><fieldset><legend>Have you participated in a leadership, entrepreneurship, professional development or similar programme before?</legend><ChoiceGrid name="previous programme" options={[["yes", "Yes"], ["no", "No"]]} error={errors.previousProgramme?.message} {...radio("previousProgramme")} /></fieldset>{values.previousProgramme === "yes" && <Field label="Please tell us briefly which programme" error={errors.previousProgrammeDetails?.message}><input {...register("previousProgrammeDetails")} /></Field>}<fieldset><legend>Are you available to attend both physical Bootcamp days?</legend><p className="registration-date-card">8–9 December 2026 · 9:00 AM–3:00 PM · Benin City</p><ChoiceGrid name="availability" options={[["yes", "Yes"], ["no", "No"]]} error={errors.availableBothDays?.message} {...radio("availableBothDays")} /></fieldset></motion.div>}</AnimatePresence></>}
      {step === 4 && <><h1 id="registration-heading" tabIndex={-1} ref={heading}>Review and <em>confirm.</em></h1><p className="registration-intro">Check the essentials before completing your registration.</p><div className="registration-review"><button type="button" onClick={() => setStep(0)}><span>01 · About you</span><b>{values.fullName}</b><small>{values.email} · {values.phone}</small><i>Edit</i></button><button type="button" onClick={() => setStep(1)}><span>02 · Background</span><b>{values.participantType.replaceAll("_", " ")}</b><small>{values.state} · {values.cityOrLga}</small><i>Edit</i></button><button type="button" onClick={() => setStep(2)}><span>03 · YELS</span><b>{values.interests.join(", ") || "No interests selected"}</b><i>Edit</i></button><button type="button" onClick={() => setStep(3)}><span>04 · Bootcamp</span><b>{values.bootcampApplied === "yes" ? "Application included" : "Summit registration only"}</b><i>Edit</i></button></div><label className="registration-check"><input type="checkbox" {...register("consent")} /><span>I confirm that the information I have provided is accurate and consent to its use for the administration of YELS 2026 in accordance with the <a href="#privacy-notice">Privacy Notice</a>.</span></label>{errors.consent?.message && <p className="form-error" role="alert">{errors.consent.message}</p>}<label className="registration-check"><input type="checkbox" {...register("marketingConsent")} /><span>I would like to receive information about future YELS/YALI programmes and opportunities.</span></label>{serverError && <p className="registration-server-error" role="alert">{serverError}</p>}</>}
    </motion.section></AnimatePresence>
    <div className="registration-actions">{step > 0 && <button type="button" className="registration-back" onClick={() => setStep((current) => current - 1)}>← Back</button>}{step < 4 ? <button type="button" className="registration" onClick={next}>Continue <span aria-hidden="true">→</span></button> : <button className="registration" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Complete registration"} <span aria-hidden="true">→</span></button>}</div>
  </form>;
}
