import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { FullIDCardPair, initCardQRs } from "../../components/IDCard.js";

const LINKS = [
  { href: "#/student/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/student/id", label: "My ID", icon: "▤" },
  { href: "#/student/certificates", label: "Certificates", icon: "★" },
  { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
  { href: "#/student/payments", label: "Payments", icon: "₵" },
];

export function StudentIDView() {
  const s = currentSession();
  if (!s || s.role !== "student") return redirectLogin();
  const student = db.findStudent(s.ref);
  if (!student) return redirectLogin();

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>My TSID Card</h1>
        <p>Your national student identification card. Use the button below to print or save as PDF.</p>
      </div>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>

    <div class="print-area">
      ${FullIDCardPair(student)}
    </div>

    <div class="tsid-card" style="margin-top:20px">
      <h3>Card Details</h3>
      <p style="font-size:13px;color:#64748b">
        This TSID card is a lifelong national student identifier. Scan the QR code on the front
        to verify authenticity via <strong>verify.tsid.go.tz</strong>. The card remains valid
        throughout your academic career — from primary school through university.
      </p>
    </div>
  `;

  return Shell("Student/Parent", "#/student/id", LINKS, html);
}

export function initStudentID() {
  initCardQRs();
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/student"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
