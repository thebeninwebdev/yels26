import "server-only";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient } from "./gemini";
import {
  bootcampAssistResponseSchema,
  bootcampWritingSystemInstruction,
  buildBootcampWritingPrompt,
  type AiBootcampField,
} from "./bootcamp-writing-policy";

export const BOOTCAMP_WRITING_MODEL = "gemini-3.5-flash-lite";

const responseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    improvedText: {
      type: "string",
      description: "The applicant's improved answer as one natural paragraph.",
    },
  },
  required: ["improvedText"],
} as const;

export async function improveBootcampAnswer(field: AiBootcampField, text: string) {
  const response = await getGeminiClient().models.generateContent({
    model: BOOTCAMP_WRITING_MODEL,
    contents: buildBootcampWritingPrompt(field, text),
    config: {
      systemInstruction: bootcampWritingSystemInstruction,
      temperature: 0.2,
      maxOutputTokens: 256,
      responseMimeType: "application/json",
      responseJsonSchema,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      automaticContinuation: false,
      httpOptions: {
        timeout: 15_000,
        retryOptions: { attempts: 1 },
      },
    },
  });

  const rawText = response.text;
  if (!rawText) throw new Error("Gemini returned no writing suggestion");

  return bootcampAssistResponseSchema.parse(JSON.parse(rawText));
}

export function getGeminiErrorStatus(error: unknown) {
  return error instanceof ApiError ? error.status : undefined;
}
