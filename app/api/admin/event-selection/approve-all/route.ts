import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { approveAllPendingEventApplicants, EventSelectionError } from "@/lib/admin/event-selection-mutations";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await approveAllPendingEventApplicants(admin.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof EventSelectionError) return NextResponse.json({ error: error.message, ...error.details }, { status: error.status });
    console.error("Approve all pending event applicants failed", error);
    return NextResponse.json({ error: "Pending applicants could not be approved." }, { status: 500 });
  }
}
