import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getEmailDeliverySummary, getEmailQuota } from "@/lib/admin/event-selection-emails";
import { getEventSettings } from "@/lib/admin/event-settings";

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [summary, quota, settings] = await Promise.all([getEmailDeliverySummary(), getEmailQuota(), getEventSettings()]);
  return NextResponse.json({ success: true, selectionFinalized: settings.selectionFinalized, summary, quota });
}
