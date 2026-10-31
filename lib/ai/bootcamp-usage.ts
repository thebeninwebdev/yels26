import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { AiAssistUsage } from "@/lib/models/ai-assist-usage";
import type { AiBootcampField } from "./bootcamp-writing-policy";

export const MAX_AI_GENERATIONS_PER_FIELD = 3;
export const MAX_AI_GENERATIONS_TOTAL = 9;
export const AI_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

const emptyCounts = {
  bootcampReason: 0,
  bootcampCurrentWork: 0,
  bootcampChallenge: 0,
};

type UsageValue = {
  counts: Record<AiBootcampField, number>;
  total: number;
};

function expiryFrom(now: Date) {
  return new Date(now.getTime() + AI_SESSION_MAX_AGE_SECONDS * 1000);
}

export async function reserveBootcampAssistUsage(sessionHash: string, field: AiBootcampField) {
  await connectToDatabase();
  const now = new Date();
  const expiresAt = expiryFrom(now);

  try {
    await AiAssistUsage.updateOne(
      { sessionHash },
      { $setOnInsert: { sessionHash, counts: emptyCounts, total: 0, expiresAt } },
      { upsert: true },
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }

  await AiAssistUsage.updateOne(
    { sessionHash, expiresAt: { $lte: now } },
    { $set: { counts: emptyCounts, total: 0, expiresAt } },
  );

  const countPath = `counts.${field}`;
  const usage = await AiAssistUsage.findOneAndUpdate(
    {
      sessionHash,
      expiresAt: { $gt: now },
      [countPath]: { $lt: MAX_AI_GENERATIONS_PER_FIELD },
      total: { $lt: MAX_AI_GENERATIONS_TOTAL },
    },
    { $inc: { [countPath]: 1, total: 1 } },
    { new: true },
  ).lean<UsageValue | null>();

  if (!usage) return null;
  return {
    remainingAttempts: Math.max(0, MAX_AI_GENERATIONS_PER_FIELD - usage.counts[field]),
  };
}

export async function releaseBootcampAssistUsage(sessionHash: string, field: AiBootcampField) {
  const countPath = `counts.${field}`;
  await AiAssistUsage.updateOne(
    { sessionHash, [countPath]: { $gt: 0 }, total: { $gt: 0 } },
    { $inc: { [countPath]: -1, total: -1 } },
  );
}
