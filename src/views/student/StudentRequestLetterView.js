import { Shell } from "../../components/Shell.js";
import { currentSession, db, genLetterRef, log } from "../../store/db.js";
import { fmtDate, fmtDateTime, escapeHtml } from "../../lib/util.js";
import { downloadRequestLetterPDF } from "../../lib/pdf.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/student/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/student/id", label: "My ID", icon: "▤" },
  { href: "#/student/certificates", label: "Certificates", icon: "★" },
  { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
  { href: "#/student/payments", label: "Payments", icon: "₵" },
];

export function StudentRequestLetterView() {
  const s = currentSession();
  if (!s || s.role !== "student") return redirectLogin();
  const student = db.findStudent(s.ref);
  if (!student) return redirectLogin();

  const letters = db.lettersForStudent(student.tsid);

  const rows = letters
    .map(
      (l) => `<tr>
        <td class="mono">${escapeHtml(l.ref)}</td>
        <td><span class="badge ${l.status === "approved" ? "green" : "yellow"}">${escapeHtml(l.status)}</span></td>
        <td>${escapeHtml(l.reason || "—")}</td>
        <td>${fmtDateTime(l.requestedAt)}</td>
        <td>${l.approvedAt ? fmtDate(l.approvedAt) : "—"}</td>
        <td>
          ${
            l.status === "approved"
              ? `<button class="btn btn-primary btn-sm" data-dl="${escapeHtml(l.ref)}">⬇ Download PDF</button>`
              : `<span style="font-size:11px;color:#64748b">Awaiting approval</span>`
          }
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>Request Utambulisho Letter</h1>
        <p>Request an official identification letter (Utambulisho) from your school. Approved letters can be downloaded as PDF.</p>
      </div>
    </div>

    <div class="tsid-card" style="max-width:680px;margin-bottom:24px">
      <h3>New Request</h3>
      <form class="tsid-form" id="letterForm">
        <div class="group">
          <label>Letter Type</label>
          <select id="letterType">
            <option>Utambulisho (Identification)</option>
            <option>Travel Permission</option>
            <option>Transfer Letter</option>
            <option>Confirmation of Enrollment</option>
          </select>
        </div>
        <div class="group">
          <label>Purpose / Reason</label>
          <textarea id="letterReason" rows="3" placeholder="e.g. For travel purposes during school break / For opening a bank account / etc." style="width:100%;padding:10px;border:1.5px solid #e2e8f0;border-radius:9px;font-family:inherit;font-size:13px"></textarea>
        </div>
        <button type="submit" class="btn btn-green">✉ Submit Request</button>
      </form>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>My Request Letters (${letters.length})</h3>
      </div>
      ${
        letters.length === 0
          ? `<div class="empty-state"><div class="ic">✉</div><p>No request letters yet.</p></div>`
          : `<table class="tsid-table">
              <thead><tr><th>Ref</th><th>Status</th><th>Reason</th><th>Requested</th><th>Approved</th><th>Action</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>`
      }
    </div>
  `;

  return Shell("Student/Parent", "#/student/request-letter", LINKS, html);
}

export function initStudentRequestLetter() {
  const s = currentSession();
  const student = db.findStudent(s.ref);
  const school = student ? db.findSchool(student.schoolCode) : null;

  document.getElementById("letterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!student) return;
    const letter = {
      ref: genLetterRef(),
      tsid: student.tsid,
      studentName: student.fullname,
      schoolCode: student.schoolCode,
      schoolName: student.schoolName,
      type: document.getElementById("letterType").value,
      reason: document.getElementById("letterReason").value.trim(),
      status: "approved", // auto-approved for demo (school can later require manual approval)
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    };
    db.saveLetter(letter);
    log("letter:request", `Student ${student.fullname} requested letter ${letter.ref}`);
    toast("Letter requested and approved. You can download it now.", "success");
    setTimeout(() => window.location.reload(), 800);
  });

  document.querySelectorAll("[data-dl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ref = btn.getAttribute("data-dl");
      const letter = db.getLetters().find((l) => l.ref === ref);
      if (!letter || !student) {
        toast("Letter not found.", "error");
        return;
      }
      downloadRequestLetterPDF(student, letter, school);
      toast("Utambulisho PDF downloaded.", "success");
    });
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/student"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
