import { RegistrationForm } from "./registration-form";
import "./registration.css";

export const metadata = {
  title: "Register | YELS 2026",
  description: "Register for the Youth Empowerment and Leadership Summit 2026.",
};

export default function RegisterPage() {
  return (
    <main id="main" className="registration-page" tabIndex={-1}>
      <div className="registration-shell">
        <RegistrationForm />
      </div>
    </main>
  );
}
