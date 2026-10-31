import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import { buildAttendeeQuery, parseAttendeeFilters, type AttendeeFilters } from "@/lib/admin/attendees";
import { present } from "@/lib/admin/format";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendee } from "@/lib/models/attendee";

const schema = z.object({
  format: z.enum(["xlsx", "csv"]),
  scope: z.enum(["all", "filtered", "selected"]),
  selectedIds: z.array(z.string()).max(500).default([]),
  filters: z.record(z.string(), z.string()).default({}),
  groups: z.array(z.enum(["basic", "registration", "bootcamp", "checkin", "full"])).min(1),
});

type ExportAttendee = Record<string, unknown> & {
  fullName: string; email: string; phone: string; registrationId: string; participantType: string;
  bootcampApplied: boolean; bootcampStatus: string; selectionStatus: string; registrationStatus: string; createdAt: Date;
  checkIn?: { status?: string; checkedInAt?: Date };
  ticketEmail?: { status?: string; sentAt?: Date };
  bootcampApplication?: Record<string, string>;
};
type Column = { header: string; key: string; width: number; value: (attendee: ExportAttendee) => string | Date };

const yesNo = (value?: boolean) => value ? "Yes" : "No";
const join = (value: unknown) => Array.isArray(value) ? value.map((item) => present(String(item))).join(", ") : "—";
const text = (value: unknown) => value === undefined || value === null || value === "" ? "—" : present(String(value));

function columnsFor(groups: string[]): Column[] {
  const columns: Column[] = [];
  if (groups.includes("basic")) columns.push(
    { header: "Registration ID", key: "registrationId", width: 20, value: (a) => a.registrationId },
    { header: "Full Name", key: "fullName", width: 28, value: (a) => a.fullName },
    { header: "Email", key: "email", width: 32, value: (a) => a.email },
    { header: "Phone", key: "phone", width: 20, value: (a) => a.phone },
    { header: "Attendee Type", key: "participantType", width: 24, value: (a) => present(a.participantType) },
  );
  if (groups.includes("registration")) columns.push(
    { header: "Age Range", key: "ageRange", width: 15, value: (a) => text(a.ageRange) },
    { header: "Gender", key: "gender", width: 18, value: (a) => text(a.gender) },
    { header: "Organisation", key: "organisation", width: 28, value: (a) => text(a.organisation) },
    { header: "Role / Course", key: "roleOrCourse", width: 28, value: (a) => text(a.roleOrCourse) },
    { header: "State", key: "state", width: 18, value: (a) => text(a.state) },
    { header: "City / LGA", key: "cityOrLga", width: 20, value: (a) => text(a.cityOrLga) },
    { header: "Registration Status", key: "registrationStatus", width: 20, value: (a) => present(a.registrationStatus) },
    { header: "Event Selection Status", key: "selectionStatus", width: 22, value: (a) => present(a.selectionStatus) },
    { header: "Registration Date", key: "createdAt", width: 22, value: (a) => new Date(a.createdAt) },
  );
  if (groups.includes("bootcamp")) columns.push(
    { header: "Bootcamp Applied", key: "bootcampApplied", width: 19, value: (a) => yesNo(a.bootcampApplied) },
    { header: "Bootcamp Status", key: "bootcampStatus", width: 20, value: (a) => present(a.bootcampStatus) },
  );
  if (groups.includes("checkin")) columns.push(
    { header: "Check-in Status", key: "checkInStatus", width: 19, value: (a) => present(a.checkIn?.status) },
    { header: "Check-in Time", key: "checkedInAt", width: 22, value: (a) => a.checkIn?.checkedInAt ? new Date(a.checkIn.checkedInAt) : "—" },
  );
  if (groups.includes("full")) columns.push(
    { header: "Other Attendee Type", key: "participantTypeOther", width: 24, value: (a) => text(a.participantTypeOther) },
    { header: "Interests", key: "interests", width: 36, value: (a) => join(a.interests) },
    { header: "Other Interest", key: "interestOther", width: 24, value: (a) => text(a.interestOther) },
    { header: "Expected Outcomes", key: "expectedOutcomes", width: 44, value: (a) => join(a.expectedOutcomes) },
    { header: "Person With Disability", key: "hasDisability", width: 24, value: (a) => text(a.hasDisability) },
    { header: "Accessibility Support", key: "accessibilitySupport", width: 36, value: (a) => text(a.accessibilitySupport) },
    { header: "Heard About YELS", key: "heardAbout", width: 22, value: (a) => text(a.heardAbout) },
    { header: "Other Source", key: "heardAboutOther", width: 24, value: (a) => text(a.heardAboutOther) },
    { header: "Bootcamp Motivation", key: "bootcampReason", width: 48, value: (a) => text(a.bootcampApplication?.reason) },
    { header: "Bootcamp Primary Interest", key: "bootcampPrimaryInterest", width: 28, value: (a) => text(a.bootcampApplication?.primaryInterest) },
    { header: "Current Work / Initiative", key: "bootcampCurrentWork", width: 48, value: (a) => text(a.bootcampApplication?.currentWork) },
    { header: "Bootcamp Challenge", key: "bootcampChallenge", width: 48, value: (a) => text(a.bootcampApplication?.challenge) },
    { header: "Previous Programme", key: "previousProgramme", width: 22, value: (a) => text(a.bootcampApplication?.previousProgramme) },
    { header: "Previous Programme Details", key: "previousProgrammeDetails", width: 36, value: (a) => text(a.bootcampApplication?.previousProgrammeDetails) },
    { header: "Available Both Days", key: "availableBothDays", width: 22, value: (a) => text(a.bootcampApplication?.availableBothDays) },
    { header: "Marketing Consent", key: "marketingConsent", width: 20, value: (a) => yesNo(Boolean(a.marketingConsent)) },
  );
  return columns;
}

function exportName(scope: string, filters: AttendeeFilters, extension: string) {
  const suffix = scope === "selected" ? "Selected" : filters.view === "checked_in" ? "Checked-In" : filters.view === "not_checked_in" ? "Not-Checked-In" : filters.view === "bootcamp_applicants" ? "Bootcamp-Applicants" : filters.view === "bootcamp_selected" ? "Bootcamp-Selected" : "Attendees";
  return `YELS-2026-${suffix}.${extension}`;
}

const csvCell = (value: string | Date) => `"${(value instanceof Date ? value.toLocaleString("en-NG") : value).replaceAll('"', '""')}"`;

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid export request." }, { status: 400 });
    const input = parsed.data;
    const filters = parseAttendeeFilters(input.filters);
    let query: Record<string, unknown> = input.scope === "all" ? { registrationStatus: "registered" } : buildAttendeeQuery(filters);
    if (input.scope === "selected") {
      const ids = input.selectedIds.filter(isValidObjectId);
      if (!ids.length) return NextResponse.json({ error: "Select at least one attendee." }, { status: 400 });
      query = { _id: { $in: ids }, registrationStatus: "registered" };
    }
    await connectToDatabase();
    const attendees = await Attendee.find(query).sort({ createdAt: -1 }).lean() as unknown as ExportAttendee[];
    const columns = columnsFor(input.groups);
    const filename = exportName(input.scope, filters, input.format);

    if (input.format === "csv") {
      const rows = [columns.map((column) => csvCell(column.header)).join(","), ...attendees.map((attendee) => columns.map((column) => csvCell(column.value(attendee))).join(","))];
      return new Response(`\uFEFF${rows.join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` } });
    }

    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "YELS 2026 Admin";
    const worksheet = workbook.addWorksheet("YELS 2026 Attendees", { views: [{ state: "frozen", ySplit: 1 }] });
    worksheet.columns = columns.map((column) => ({ header: column.header, key: column.key, width: column.width }));
    attendees.forEach((attendee) => worksheet.addRow(Object.fromEntries(columns.map((column) => [column.key, column.value(attendee)]))));
    worksheet.autoFilter = { from: "A1", to: worksheet.getRow(1).getCell(columns.length).address };
    worksheet.getRow(1).height = 24;
    worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true, color: { argb: "FFF5F7FA" } }; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF07101B" } }; cell.alignment = { vertical: "middle" }; });
    worksheet.eachRow((row, index) => { if (index > 1) { row.alignment = { vertical: "top", wrapText: true }; row.eachCell((cell) => { if (cell.value instanceof Date) cell.numFmt = "dd mmm yyyy, hh:mm AM/PM"; }); } });
    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(Buffer.from(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${filename}"` } });
  } catch (error) {
    console.error("Attendee export failed", error);
    return NextResponse.json({ error: "The attendee export could not be prepared." }, { status: 500 });
  }
}
