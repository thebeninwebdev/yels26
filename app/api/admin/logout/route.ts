import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const response = await fetch(new URL("/api/auth/sign-out", request.url), { method: "POST", headers: request.headers });
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303, headers: response.headers });
}
