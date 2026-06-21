// ============================================================================
//  StudentRequestLetterView — Request & download Utambulisho letters
//  Design language: E-Mtaa green government aesthetic (e-mtaatz.xyz)
// ============================================================================

import { Shell } from "../../components/Shell.js";
import { currentSession, db, genLetterRef, log } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";
import { downloadRequestLetterPDF } from "../../lib/pdf.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/student/dashboard",      label: "Dashboard",           icon: "▣" },
  { href: "#/student/id",             label: "My ID",               icon: "▤" },
  { href: "#/student/certificates",   label: "Certificates",        icon: "★" },
  { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
  { href: "#/student/payments",       label: "Payments",            icon: "₵" },
];

const LETTER_TYPES = [
  { value: "utambulisho", label: "Utambulisho (General ID Letter)" },
  { value: "travel",      label: "Travel Identification Letter" },
  { value: "bank",        label: "Bank / Financial Services Letter" },
  { value: "employment",  label: "Employment Verification Letter" },
  { value: "scholarship", label: "Scholarship Application Letter" },
  { value: "government",  label: "Government Services Letter" },
  { value: "other",       label: "Other Purpose" },
];

function letterTypeLabel(value) {
  return LETTER_TYPES.find((t) => t.value === value)?.label || value || "Utambulisho";
}

// ============================================================================
//  View
// ============================================================================
export function StudentRequestLetterView() {
  const s = currentSession();
  if (!s || s.role !== "student") return redirectLogin();
  const student = db.findStudent(s.ref);
  if (!student) return redirectLogin();

  const school  = db.findSchool(student.schoolCode);
  const letters = db.lettersForStudent(student.tsid);

  const approved = letters.filter((l) => l.status === "approved").length;
  const pending  = letters.filter((l) => l.status === "pending").length;
  const rejected = letters.filter((l) => l.status === "rejected").length;

  const typeOptions = LETTER_TYPES.map(
    (t) => `<option value="${t.value}">${escapeHtml(t.label)}</option>`
  ).join("");

  const historyRows = _buildRows(letters);

  const infoRows = [
    ["Full Name",       escapeHtml(student.fullname)],
    ["TSID Number",     escapeHtml(student.tsid)],
    ["Date of Birth",   fmtDate(student.dob)],
    ["Gender",          escapeHtml(student.gender || "—")],
    ["Current Level",   escapeHtml(student.level || "—")],
    ["School",          escapeHtml(student.schoolName)],
    ["Region",          escapeHtml(student.region)],
    ["District",        escapeHtml(student.district)],
    ["Ward",            escapeHtml(student.ward || "—")],
    ["Guardian",        escapeHtml(student.parentName || "—")],
  ].map(([k, v]) => `
    <div style="display:flex;justify-content:space-between;padding:7px 0;
      border-bottom:1px solid #f0fdf4;font-size:12.5px;gap:8px">
      <span style="color:#6b7280;font-weight:600;flex-shrink:0">${k}</span>
      <span style="font-weight:700;text-align:right;color:#111827;word-break:break-word">${v}</span>
    </div>`).join("");

  const html = `

    <!-- ── Page header ──────────────────────────────────────────────────── -->
    <div class="tsid-page-head">
      <div>
        <h1>Omba Barua ya Utambulisho</h1>
        <p>Request an official identification letter from your school. Approved letters are available to download as PDF.</p>
      </div>
    </div>

    <!-- ── Stats row ────────────────────────────────────────────────────── -->
    <div style="class="rg-4" style="margin-bottom:22px">
      ${[
        ["Total",    letters.length, "#1e40af", "#eff6ff", "#bfdbfe", "📋"],
        ["Approved", approved,       "#065f46", "#ecfdf5", "#6ee7b7", "✅"],
        ["Pending",  pending,        "#92400e", "#fffbeb", "#fcd34d", "⏳"],
        ["Rejected", rejected,       "#991b1b", "#fef2f2", "#fca5a5", "❌"],
      ].map(([label, val, textColor, bg, border, icon]) => `
        <div style="
          background:${bg};border:1.5px solid ${border};border-radius:14px;
          padding:14px 16px;display:flex;align-items:center;gap:12px">
          <div style="font-size:22px;line-height:1">${icon}</div>
          <div>
            <div style="font-size:22px;font-weight:900;color:${textColor};line-height:1">${val}</div>
            <div style="font-size:11.5px;font-weight:600;color:${textColor};opacity:.75;margin-top:2px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- ── Two-column: form + summary ───────────────────────────────────── -->
    <div style="class="rg-sidebar" style="margin-bottom:28px">

      <!-- Form card -------------------------------------------------------->
      <div style="
        background:#fff;border:1.5px solid #d1fae5;border-radius:16px;
        box-shadow:0 2px 12px rgba(5,150,105,.07);overflow:hidden">

        <!-- Card header -->
        <div style="
          background:linear-gradient(135deg,#059669 0%,#047857 100%);
          padding:16px 22px;display:flex;align-items:center;gap:12px">
          <div style="
            width:38px;height:38px;border-radius:10px;
            background:rgba(255,255,255,.18);
            display:flex;align-items:center;justify-content:center;
            font-size:18px;flex-shrink:0">✉️</div>
          <div>
            <div style="font-weight:800;font-size:15px;color:#fff">Omba Barua Mpya</div>
            <div style="font-size:12px;color:#a7f3d0;margin-top:1px">Fill in the details below and submit your request.</div>
          </div>
        </div>

        <!-- Form body -->
        <div style="padding:22px 24px">

          <!-- Info banner -->
          <div style="
            display:flex;gap:12px;align-items:flex-start;
            background:linear-gradient(135deg,#f0fdf4,#dcfce7);
            border:1px solid #bbf7d0;border-radius:12px;
            padding:14px 16px;margin-bottom:20px">
            <div style="font-size:20px;flex-shrink:0">ℹ️</div>
            <div style="font-size:12.5px;color:#166534;line-height:1.6">
              <strong>What is an Utambulisho letter?</strong><br>
              An official letter confirming your identity and student status — accepted at banks,
              government offices, employers and scholarship bodies across Tanzania.
            </div>
          </div>

          <!-- Letter type -->
          <div style="margin-bottom:18px">
            <label style="
              display:block;font-size:12.5px;font-weight:700;
              color:#374151;margin-bottom:6px">
              Letter Type <span style="color:#ef4444">*</span>
            </label>
            <select id="rl-type" style="
              width:100%;padding:10px 14px;border-radius:10px;
              border:1.5px solid #d1fae5;font-size:13px;color:#111827;
              background:#f9fafb;appearance:auto;
              outline:none;transition:border-color .2s">
              <option value="">— Select letter type —</option>
              ${typeOptions}
            </select>
          </div>

          <!-- Reason -->
          <div style="margin-bottom:18px">
            <label style="
              display:block;font-size:12.5px;font-weight:700;
              color:#374151;margin-bottom:6px">
              Purpose / Reason <span style="color:#ef4444">*</span>
            </label>
            <textarea id="rl-reason" rows="3" maxlength="400"
              placeholder="e.g. Required for opening a bank account at CRDB Bank Mwanza branch."
              style="
                width:100%;padding:10px 14px;border-radius:10px;
                border:1.5px solid #d1fae5;font-size:13px;color:#111827;
                background:#f9fafb;resize:vertical;min-height:88px;
                line-height:1.55;font-family:inherit;
                outline:none;transition:border-color .2s"></textarea>
            <div style="text-align:right;font-size:11px;color:#9ca3af;margin-top:3px">
              <span id="rl-char">0</span>/400
            </div>
          </div>

          <!-- Addressee -->
          <div style="margin-bottom:20px">
            <label style="
              display:block;font-size:12.5px;font-weight:700;
              color:#374151;margin-bottom:6px">
              Addressed To <span style="font-weight:400;color:#9ca3af">(optional)</span>
            </label>
            <input id="rl-addressee" type="text" maxlength="120"
              placeholder="e.g. Branch Manager, CRDB Bank Mwanza"
              style="
                width:100%;padding:10px 14px;border-radius:10px;
                border:1.5px solid #d1fae5;font-size:13px;color:#111827;
                background:#f9fafb;outline:none;transition:border-color .2s">
          </div>

          <!-- Urgency pills -->
          <div style="margin-bottom:22px">
            <label style="display:block;font-size:12.5px;font-weight:700;color:#374151;margin-bottom:8px">
              Urgency
            </label>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button id="rl-urg-normal" class="rl-pill active-pill" data-val="normal">
                🕐 Normal (3–5 days)
              </button>
              <button id="rl-urg-urgent" class="rl-pill" data-val="urgent">
                ⚡ Urgent (1–2 days)
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button id="rl-submit" style="
            width:100%;padding:13px;border-radius:12px;border:none;cursor:pointer;
            background:linear-gradient(135deg,#059669,#047857);
            color:#fff;font-size:14px;font-weight:800;
            display:flex;align-items:center;justify-content:center;gap:8px;
            box-shadow:0 4px 12px rgba(5,150,105,.3);
            transition:opacity .2s">
            ✉ Submit Letter Request
          </button>

          <p style="font-size:11.5px;color:#9ca3af;text-align:center;margin-top:10px">
            Your school will be notified and will process the request within the stated timeframe.
          </p>
        </div>
      </div>

      <!-- Right column: student info + stats -------------------------------->
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Student summary -->
        <div style="
          background:#fff;border:1.5px solid #d1fae5;border-radius:16px;
          box-shadow:0 2px 8px rgba(5,150,105,.06);overflow:hidden">
          <div style="
            background:linear-gradient(135deg,#059669,#047857);
            padding:12px 16px">
            <div style="font-weight:800;font-size:13px;color:#fff">👤 Your Details</div>
            <div style="font-size:11px;color:#a7f3d0;margin-top:2px">These appear on the letter</div>
          </div>
          <div style="padding:12px 16px">${infoRows}</div>
        </div>

        <!-- Quick tips -->
        <div style="
          background:#fffbeb;border:1.5px solid #fde68a;border-radius:14px;
          padding:14px 16px">
          <div style="font-weight:800;font-size:12.5px;color:#92400e;margin-bottom:8px">💡 Tips</div>
          <ul style="margin:0;padding-left:16px;font-size:12px;color:#78350f;line-height:1.7">
            <li>Be specific about the reason for your request.</li>
            <li>If addressed to an officer, include their full title.</li>
            <li>Approved letters are valid for <strong>30 days</strong> from issue date.</li>
            <li>PDF is government-branded with official TSID seal.</li>
          </ul>
        </div>

      </div>
    </div>

    <!-- ── History table ────────────────────────────────────────────────── -->
    <div style="
      background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;
      box-shadow:0 2px 8px rgba(0,0,0,.04);overflow:hidden">
      <div style="
        display:flex;justify-content:space-between;align-items:center;
        padding:14px 20px;border-bottom:1px solid #f1f5f9">
        <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">
          Letter History <span style="font-size:12px;font-weight:600;color:#64748b">(${letters.length})</span>
        </h3>
        <span style="font-size:12px;color:#64748b">Approved letters can be downloaded as PDF</span>
      </div>
      <table class="tsid-table">
        <thead>
          <tr>
            <th>Ref No.</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Requested</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="rl-history">${historyRows}</tbody>
      </table>
    </div>

    <!-- Urgency pill styles (inline, no extra CSS file needed) -->
    <style>
      .rl-pill {
        padding:9px 16px;border-radius:20px;font-size:13px;font-weight:700;
        cursor:pointer;border:1.5px solid #e2e8f0;
        background:#f8fafc;color:#64748b;transition:all .15s;
      }
      .rl-pill.active-pill {
        background:linear-gradient(135deg,#059669,#047857);
        color:#fff;border-color:#047857;
        box-shadow:0 3px 8px rgba(5,150,105,.25);
      }
      #rl-type:focus, #rl-reason:focus, #rl-addressee:focus {
        border-color:#059669 !important;
        box-shadow:0 0 0 3px rgba(5,150,105,.12);
      }
    </style>
  `;

  return Shell("Student/Parent", "#/student/request-letter", LINKS, html);
}

// ============================================================================
//  Init
// ============================================================================
export function initStudentRequestLetter() {
  const s       = currentSession();
  const student = db.findStudent(s?.ref);
  const school  = student ? db.findSchool(student.schoolCode) : null;
  if (!student) return;

  // Char counter
  const reasonEl = document.getElementById("rl-reason");
  const charEl   = document.getElementById("rl-char");
  reasonEl?.addEventListener("input", () => {
    if (charEl) charEl.textContent = reasonEl.value.length;
  });

  // Urgency pills
  let urgency = "normal";
  document.querySelectorAll(".rl-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".rl-pill").forEach((p) => p.classList.remove("active-pill"));
      pill.classList.add("active-pill");
      urgency = pill.dataset.val || "normal";
    });
  });

  // Submit
  document.getElementById("rl-submit")?.addEventListener("click", () => {
    const type      = document.getElementById("rl-type")?.value.trim();
    const reason    = document.getElementById("rl-reason")?.value.trim();
    const addressee = document.getElementById("rl-addressee")?.value.trim();

    if (!type) {
      toast("Please select a letter type.", "error");
      return;
    }
    if (!reason || reason.length < 10) {
      toast("Please enter a reason (at least 10 characters).", "error");
      return;
    }

    const ref    = genLetterRef();
    const letter = {
      ref,
      tsid:        student.tsid,
      studentName: student.fullname,
      schoolCode:  student.schoolCode,
      schoolName:  student.schoolName,
      type,
      reason,
      addressee:   addressee || null,
      urgency,
      status:      "approved",
      requestedAt: new Date().toISOString(),
      approvedAt:  new Date().toISOString(),
    };

    db.saveLetter(letter);
    log("letter:request", `Student ${student.tsid} requested letter ${ref}`);

    // Reset form
    if (document.getElementById("rl-type"))      document.getElementById("rl-type").value = "";
    if (document.getElementById("rl-reason"))    document.getElementById("rl-reason").value = "";
    if (document.getElementById("rl-addressee")) document.getElementById("rl-addressee").value = "";
    if (charEl) charEl.textContent = "0";

    toast("✅ Letter submitted and approved! Download it below.", "success");
    _refreshTable(student, school);
  });

  // PDF downloads
  _bindDownloads(student, school);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function _buildRows(letters) {
  if (!letters.length) {
    return `<tr>
      <td colspan="6" style="text-align:center;padding:32px 0;color:#94a3b8;font-size:13px">
        No letters requested yet. Use the form above to submit your first request.
      </td>
    </tr>`;
  }
  return letters
    .slice()
    .reverse()
    .map((l) => `
      <tr>
        <td class="mono" style="font-size:12px">${escapeHtml(l.ref)}</td>
        <td style="font-size:12.5px">${escapeHtml(letterTypeLabel(l.type))}</td>
        <td style="max-width:200px;white-space:normal;font-size:12.5px">${escapeHtml(l.reason || "—")}</td>
        <td style="font-size:12px">${fmtDate(l.requestedAt)}</td>
        <td>
          ${l.status === "approved"
            ? `<span class="badge green">✓ Approved</span>`
            : l.status === "rejected"
            ? `<span class="badge red">✗ Rejected</span>`
            : `<span class="badge yellow">⏳ Pending</span>`}
        </td>
        <td>
          ${l.status === "approved"
            ? `<button class="btn btn-primary btn-sm" data-dl="${escapeHtml(l.ref)}">⬇ PDF</button>`
            : `<span style="font-size:11px;color:#94a3b8">—</span>`}
        </td>
      </tr>`)
    .join("");
}

function _refreshTable(student, school) {
  const tbody = document.getElementById("rl-history");
  if (!tbody) return;
  tbody.innerHTML = _buildRows(db.lettersForStudent(student.tsid));
  _bindDownloads(student, school);
}

function _bindDownloads(student, school) {
  document.querySelectorAll("[data-dl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const letter = db.getLetters().find((l) => l.ref === btn.getAttribute("data-dl"));
      if (!letter) { toast("Letter not found.", "error"); return; }
      try {
        downloadRequestLetterPDF(student, letter, school);
        toast("📄 Utambulisho PDF downloaded.", "success");
        log("letter:download", `Student ${student.tsid} downloaded ${letter.ref}`);
      } catch (e) {
        toast("PDF generation failed. Please try again.", "error");
        console.error(e);
      }
    });
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/student"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
