import { PageFrame } from "../components/page-frame";
import { RegistrationForm } from "./registration-form";
import "./registration.css";

export const metadata = {
  title: "Register | YELS 2026",
  description: "Register for the Youth Empowerment and Leadership Summit 2026.",
};

export default function RegisterPage() {
  return (
    <PageFrame>
      <main id="main" className="registration-page" tabIndex={-1}>
        <div className="registration-shell container">
          <div className="registration-heading">
            <p className="eyebrow">YOUTH EMPOWERMENT &amp; LEADERSHIP SUMMIT</p>
            <p>BENIN CITY, EDO STATE · 5 DECEMBER 2026</p>
          </div>
          <RegistrationForm />
        </div>
      </main>
    </PageFrame>
  );
}
