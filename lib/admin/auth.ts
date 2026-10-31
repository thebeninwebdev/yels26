import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/lib/models/admin";
import { auth } from "@/lib/auth";

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  await connectToDatabase();
  const admin = await Admin.findOne({ email: session.user.email }).select("fullName email role status sessionVersion").lean();
  if (!admin || admin.status !== "active") return null;
  return { id: admin._id.toString(), fullName: admin.fullName, email: admin.email, role: admin.role, sessionVersion: admin.sessionVersion };
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}
