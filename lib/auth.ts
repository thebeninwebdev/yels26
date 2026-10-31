import "server-only";
import bcrypt from "bcryptjs";
import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { Resend } from "resend";
import { getAuthDatabase } from "./better-auth-db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: mongodbAdapter(getAuthDatabase()),
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.ADMIN_SESSION_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: async (password) => bcrypt.hash(password, 12),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
    },
    sendResetPassword: async ({ user, token }) => {
      if (!resend || !process.env.EMAIL_FROM_ADDRESS) return;
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password/confirm?token=${encodeURIComponent(token)}`;
      await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || "YELS 2026"} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: "Reset your YELS admin password",
        text: `Reset your password using this link: ${resetUrl}`,
      });
    },
  },
});
