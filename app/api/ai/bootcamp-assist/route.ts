import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGeminiErrorStatus, improveBootcampAnswer } from "@/lib/ai/bootcamp-writing";
import { bootcampAssistRequestSchema } from "@/lib/ai/bootcamp-writing-policy";
import {
  AI_SESSION_MAX_AGE_SECONDS,
  releaseBootcampAssistUsage,
  reserveBootcampAssistUsage,
} from "@/lib/ai/bootcamp-usage";
import { isGeminiConfigured } from "@/lib/ai/gemini";

const AI_SESSION_COOKIE = "yels_ai_session";

function getAiSession(request: NextRequest) {
  const existing = request.cookies.get(AI_SESSION_COOKIE)?.value;
  const token = existing && /^[a-f0-9]{64}$/i.test(existing)
    ? existing
    : randomBytes(32).toString("hex");

  return {
    token,
    isNew: token !== existing,
    hash: createHash("sha256").update(token).digest("hex"),
  };
}

function json(
  body: Record<string, unknown>,
  status: number,
  session?: ReturnType<typeof getAiSession>,
) {
  const response = NextResponse.json(body, { status });
  if (session?.isNew) {
    response.cookies.set(AI_SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: AI_SESSION_MAX_AGE_SECONDS,
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const parsed = bootcampAssistRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return json({ error: "Please enter at least 10 characters before using writing help.", code: "INVALID_REQUEST" }, 400);
  }

  if (!isGeminiConfigured()) {
    return json({ error: "Writing help is temporarily unavailable.", code: "AI_NOT_CONFIGURED" }, 503);
  }

  const { field, text } = parsed.data;
  const session = getAiSession(request);
  let reservation: { remainingAttempts: number } | null = null;

  try {
    reservation = await reserveBootcampAssistUsage(session.hash, field);
    if (!reservation) {
      return json({ error: "You've used the writing helper three times for this question.", code: "USAGE_LIMIT" }, 429, session);
    }

    const suggestion = await improveBootcampAnswer(field, text);
    return json({ ...suggestion, remainingAttempts: reservation.remainingAttempts }, 200, session);
  } catch (error) {
    if (reservation) {
      try {
        await releaseBootcampAssistUsage(session.hash, field);
      } catch (releaseError) {
        console.error("Gemini bootcamp usage release failed", {
          field,
          errorName: releaseError instanceof Error ? releaseError.name : "UnknownError",
        });
      }
    }

    const upstreamStatus = getGeminiErrorStatus(error);
    console.error("Gemini bootcamp writing assist failed", {
      field,
      upstreamStatus,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    if (upstreamStatus === 429) {
      return json({ error: "Writing help is busy right now. Please try again shortly or continue with your own answer.", code: "AI_RATE_LIMITED" }, 503, session);
    }
    return json({ error: "Writing help is temporarily unavailable.", code: "AI_UNAVAILABLE" }, 503, session);
  }
}
