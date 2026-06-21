import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";
import { downloadCertificatePDF } from "../../lib/pdf.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/student/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/student/id", label: "My ID", icon: "▤" },
  { href: "#/student/certificates", label: "Certificates", icon: "★" },
  { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
  { href: "#/student/payments", label: "Payments", icon: "₵" },
];

export function StudentCertificatesView() {
  const s = currentSession();
  if (!s || s.role !== "student") return redirectLogin();
  const student = db.findStudent(s.ref);
  if (!student) return redirectLogin();

  const school = db.findSchool(student.schoolCode);
  const certs = db.certificatesForStudent(student.tsid);

  const rows = certs
    .map(
      (c) => `<tr>
        <td class="mono">${escapeHtml(c.ref)}</td>
        <td><div style="font-weight:700">${escapeHtml(c.title)}</div></td>
        <td>${escapeHtml(c.schoolName || student.schoolName)}</td>
        <td>${fmtDate(c.issuedAt)}</td>
        <td><span class="badge green">Issued</span></td>
        <td>
          <button class="btn btn-primary btn-sm" data-dl="${escapeHtml(c.id)}">⬇ Download PDF</button>
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>My Certificates</h1>
        <p>Download official TSID certificates issued to you.</p>
      </div>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>Certificates (${certs.length})</h3>
      </div>
      ${
        certs.length === 0
          ? `<div class="empty-state"><div class="ic">★</div><p>No certificates yet. Certificates are issued when your TSID is created.</p></div>`
          : `<table class="tsid-table">
              <thead><tr><th>Ref</th><th>Title</th><th>School</th><th>Issued</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>`
      }
    </div>
  `;

  return Shell("Student/Parent", "#/student/certificates", LINKS, html);
}

export function initStudentCertificates() {
  const s = currentSession();
  const student = db.findStudent(s.ref);
  const school = student ? db.findSchool(student.schoolCode) : null;

  document.querySelectorAll("[data-dl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-dl");
      const cert = db.getCertificates().find((c) => c.id === id);
      if (!cert || !student) {
        toast("Certificate not found.", "error");
        return;
      }
      downloadCertificatePDF(student, cert, school);
      toast("Certificate PDF downloaded.", "success");
    });
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/student"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
