import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { MiniIDCard } from "../../components/IDCard.js";
import { fmtDate, fmtMoney, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/student/dashboard",      label: "Dashboard",           icon: "▣" },
  { href: "#/student/id",             label: "My ID",               icon: "▤" },
  { href: "#/student/certificates",   label: "Certificates",        icon: "★" },
  { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
  { href: "#/student/payments",       label: "Payments",            icon: "₵" },
];

export function StudentDashboardView() {
  const s = currentSession();
  if (!s || s.role !== "student") return redirectLogin();
  const student = db.findStudent(s.ref);
  if (!student) return redirectLogin();

  const school      = db.findSchool(student.schoolCode);
  const certs       = db.certificatesForStudent(student.tsid);
  const letters     = db.lettersForStudent(student.tsid);
  const payments    = db.paymentsForStudent(student.tsid);
  const paidPays    = payments.filter((p) => p.status === "paid");
  const pendingPays = payments.filter((p) => p.status === "pending");
  const totalPaid   = paidPays.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const firstName   = student.fullname.split(" ")[0];

  // Account info rows
  const infoRows = [
    ["TSID Number",      escapeHtml(student.tsid),                        true],
    ["Current Level",    escapeHtml(student.level || "—"),                false],
    ["Enrollment Date",  fmtDate(student.enrollmentDate),                 false],
    ["Blood Group",      escapeHtml(student.bloodGroup || "—"),           false],
    ["Nationality",      escapeHtml(student.nationality || "Tanzanian"),  false],
    ["School",           escapeHtml(student.schoolName),                  false],
    ["School Code",      escapeHtml(student.schoolCode),                  false],
    ["Region",           `${escapeHtml(student.region)} / ${escapeHtml(student.district)}`, false],
    ["Ward",             escapeHtml(student.ward || "—"),                 false],
    ["School Contact",   escapeHtml((school && school.contact) || student.schoolContact || "—"), false],
    ["Parent/Guardian",  `${escapeHtml(student.parentName || "—")} (${escapeHtml(student.relationship || "—")})`, false],
    ["Parent Phone",     escapeHtml(student.parentPhone || "—"),          false],
  ].map(([k, v, mono]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;gap:12px">
      <span style="color:#64748b;font-weight:600;flex-shrink:0">${k}</span>
      <span style="${mono ? "font-family:ui-monospace;font-size:12px;" : ""}font-weight:700;text-align:right;color:#0f172a;word-break:break-word">${v}</span>
    </div>`).join("");

  const html = `

    <!-- Welcome header -->
    <div style="
      background:linear-gradient(135deg,#003366 0%,#059669 100%);
      border-radius:16px;padding:22px 26px;margin-bottom:22px;
      display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
      <div>
        <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px">
          👋 Karibu, ${escapeHtml(firstName)}!
        </div>
        <div style="font-size:13px;color:#a7f3d0;font-weight:600">
          TSID: <span style="font-family:ui-monospace;letter-spacing:.5px">${escapeHtml(student.tsid)}</span>
          · ${escapeHtml(student.level || "")}
        </div>
      </div>
      <a href="#/student/id" class="btn" style="
        background:#fff;color:#003366;font-weight:800;
        box-shadow:0 4px 12px rgba(0,0,0,.15)">
        🪪 View My ID Card →
      </a>
    </div>

    <!-- Stats -->
    <div style="class="rg-4" style="margin-bottom:22px">
      ${[
        ["Certificates",     certs.length,           "#1e40af","#eff6ff","#bfdbfe","★"],
        ["Letters Issued",   letters.filter(l=>l.status==="approved").length, "#065f46","#ecfdf5","#6ee7b7","✉"],
        ["Payments Made",    paidPays.length,         "#5b21b6","#f5f3ff","#c4b5fd","✓"],
        ["Pending Payments", pendingPays.length,      "#991b1b","#fef2f2","#fca5a5","!"],
      ].map(([label, val, tc, bg, bdr, icon]) => `
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:16px 18px;display:flex;align-items:center;gap:12px">
          <div style="font-size:24px;line-height:1">${icon}</div>
          <div>
            <div style="font-size:24px;font-weight:900;color:${tc};line-height:1">${val}</div>
            <div style="font-size:11.5px;font-weight:600;color:${tc};opacity:.75;margin-top:3px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Two-column: account info + ID card -->
    <div style="class="rg-sidebar" style="margin-bottom:24px">

      <!-- Account info -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#003366,#1e40af);padding:14px 20px">
          <div style="font-weight:800;font-size:14px;color:#fff">📋 Student Information</div>
          <div style="font-size:11.5px;color:#bfdbfe;margin-top:2px">Your registered details with TSID</div>
        </div>
        <div style="padding:14px 20px">${infoRows}</div>
      </div>

      <!-- Right column -->
      <div style="display:flex;flex-direction:column;gap:14px">

        <!-- Mini ID card -->
        <div>
          ${MiniIDCard(student)}
        </div>

        <!-- Quick actions -->
        <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:16px">
          <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:10px">⚡ Quick Actions</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <a href="#/student/id" class="btn btn-primary btn-sm" style="justify-content:flex-start;gap:8px">🪪 View & Print Full ID Card</a>
            <a href="#/student/certificates" class="btn btn-ghost btn-sm" style="justify-content:flex-start;gap:8px">★ My Certificates</a>
            <a href="#/student/request-letter" class="btn btn-ghost btn-sm" style="justify-content:flex-start;gap:8px">✉ Request Utambulisho</a>
            <a href="#/student/payments" class="btn btn-ghost btn-sm" style="justify-content:flex-start;gap:8px">₵ View Payments</a>
          </div>
        </div>

        <!-- Total paid summary -->
        <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1.5px solid #6ee7b7;
          border-radius:14px;padding:14px 16px;text-align:center">
          <div style="font-size:12px;font-weight:700;color:#065f46;margin-bottom:4px">TOTAL PAID TO DATE</div>
          <div style="font-size:20px;font-weight:900;color:#047857">TZS ${totalPaid.toLocaleString()}</div>
          <div style="font-size:11px;color:#059669;margin-top:2px">${paidPays.length} payment${paidPays.length !== 1 ? "s" : ""} completed</div>
        </div>
      </div>
    </div>

    <!-- Remarks from school -->
    ${student.remarks && student.remarks.length ? `
      <div style="background:#fff;border:1.5px solid #fde68a;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);
          padding:14px 20px;border-bottom:1px solid #fde68a;
          display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">📝</span>
          <div style="font-weight:800;font-size:14px;color:#92400e">Remarks from School</div>
        </div>
        <table class="tsid-table">
          <thead><tr><th>Remark</th><th>By</th><th>Date</th></tr></thead>
          <tbody>
            ${student.remarks.map((r) => `
              <tr>
                <td>${escapeHtml(r.text)}</td>
                <td style="font-weight:600">${escapeHtml(r.by)}</td>
                <td>${fmtDate(r.at)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : ""}

    ${pendingPays.length ? `
      <div style="margin-top:18px;background:#fef2f2;border:1.5px solid #fca5a5;
        border-radius:14px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">⚠️</span>
          <div>
            <div style="font-weight:800;font-size:14px;color:#991b1b">
              ${pendingPays.length} pending payment${pendingPays.length > 1 ? "s" : ""}
            </div>
            <div style="font-size:12px;color:#7f1d1d">Please settle your outstanding fees.</div>
          </div>
        </div>
        <a href="#/student/payments" class="btn btn-sm" style="background:#dc2626;color:#fff">Pay Now →</a>
      </div>` : ""}
  `;

  return Shell("Student/Parent", "#/student/dashboard", LINKS, html);
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/student"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
