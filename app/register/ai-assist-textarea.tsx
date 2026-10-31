"use client";

import { useState, type ChangeEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { AiBootcampField } from "@/lib/ai/bootcamp-writing-policy";

type AiAssistTextareaProps = {
  field: AiBootcampField;
  label: string;
  rows: number;
  value: string;
  error?: string;
  registration: UseFormRegisterReturn;
  onUseSuggestion: (text: string) => void;
};

const unavailableMessage = "Writing help isn't available right now. Your answer is still here, and you can continue without it.";

export function AiAssistTextarea({
  field,
  label,
  rows,
  value,
  error,
  registration,
  onUseSuggestion,
}: AiAssistTextareaProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [assistError, setAssistError] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const { onChange, ...textareaRegistration } = registration;
  const introId = `${field}-ai-intro`;
  const helperId = `${field}-ai-helper`;
  const errorId = `${field}-error`;
  const assistErrorId = `${field}-ai-error`;
  const describedBy = [introId, helperId, error ? errorId : "", assistError ? assistErrorId : ""]
    .filter(Boolean)
    .join(" ");

  const generate = async (retry = false) => {
    const source = retry ? sourceText : value.trim();
    if (source.length < 10 || loading || remainingAttempts <= 0) return;

    setLoading(true);
    setAssistError("");
    if (!retry) setSourceText(source);

    try {
      const response = await fetch("/api/ai/bootcamp-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, text: source }),
      });
      const result = await response.json().catch(() => null) as {
        improvedText?: string;
        remainingAttempts?: number;
        code?: string;
        error?: string;
      } | null;

      if (!response.ok || !result?.improvedText) {
        if (result?.code === "USAGE_LIMIT") {
          setRemainingAttempts(0);
          setAssistError("You've used the writing helper three times for this question. You can continue editing your answer yourself.");
        } else if (result?.code === "AI_RATE_LIMITED") {
          setAssistError("Writing help is busy right now. Please try again shortly or continue with your own answer.");
        } else {
          setAssistError(unavailableMessage);
        }
        return;
      }

      setSuggestion(result.improvedText);
      setRemainingAttempts(result.remainingAttempts ?? Math.max(0, remainingAttempts - 1));
    } catch {
      setAssistError(unavailableMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    if (suggestion && event.target.value !== sourceText) {
      setSuggestion("");
      setSourceText("");
    }
    setAssistError("");
    void onChange(event);
  };

  const keepMine = () => {
    setSuggestion("");
    setSourceText("");
  };

  const useSuggestion = () => {
    onUseSuggestion(suggestion);
    setSuggestion("");
    setSourceText("");
    setAssistError("");
  };

  const limitReached = remainingAttempts <= 0;

  return (
    <div className="registration-field registration-ai-assist" aria-busy={loading}>
      <label htmlFor={field}>{label} <b aria-label="required">*</b></label>
      <p id={introId} className="registration-ai-helper">{"You don't need to write formally. Tell us in your own words."}</p>
      <textarea
        id={field}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        placeholder="Write your answer in your own words"
        {...textareaRegistration}
        onChange={handleChange}
      />
      {error ? <p id={errorId} className="form-error" role="alert">{error}</p> : null}

      <div className="registration-ai-tools">
        <button
          type="button"
          className="registration-ai-trigger"
          disabled={value.trim().length < 10 || loading || limitReached}
          onClick={() => void generate()}
          aria-busy={loading}
        >
          {loading ? "✦ Improving your answer..." : "✦ Help me write this"}
        </button>
        <p id={helperId} className="registration-ai-explanation">{"We'll improve the wording without adding experience or achievements you didn't mention."}</p>
      </div>

      {assistError ? <p id={assistErrorId} className="registration-ai-error" role="alert">{assistError}</p> : null}
      {limitReached && !assistError ? (
        <p className="registration-ai-limit" role="status">{"You've used the writing helper three times for this question. You can continue editing your answer yourself."}</p>
      ) : null}

      {suggestion ? (
        <section className="registration-ai-suggestion" aria-live="polite" aria-label="Writing suggestion">
          <div className="registration-ai-suggestion-head">
            <span aria-hidden="true">✦</span>
            <h3>Suggested version</h3>
          </div>
          <p className="registration-ai-suggestion-text">{suggestion}</p>
          <p className="registration-ai-suggestion-help">You can still edit this after using it.</p>
          <div className="registration-ai-actions">
            <button type="button" onClick={keepMine}>Keep mine</button>
            <button type="button" onClick={() => void generate(true)} disabled={loading || limitReached}>Try another</button>
            <button type="button" className="registration-ai-use" onClick={useSuggestion}>Use suggestion</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
