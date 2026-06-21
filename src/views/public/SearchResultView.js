// ============================================================================
//  SearchResultView — rich student profile + school dashboard profile
// ============================================================================
import { Navbar, initNavbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db } from "../../store/db.js";
import { FullIDCardPair, initCardQRs } from "../../components/IDCard.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function breadcrumb(last) {
  return `
  <div style="background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:10px 20px">
    <div style="max-width:900px;margin:0 auto;font-size:12px;color:#64748b;
      display:flex;align-items:center;gap:5px;flex-wrap:wrap">
      <a href="#/" style="color:#64748b;text-decoration:none">Home</a>
      <span>›</span>
      <a href="#/search" style="color:#64748b;text-decoration:none">Search</a>
      <span>›</span>
      <span style="color:#0f172a;font-weight:700">${last}</span>
    </div>
  </div>`;
}

// ── Info row helper ───────────────────────────────────────────────────────────
function infoRow(label, value, mono) {
  return `
  <div style="display:flex;justify-content:space-between;align-items:flex-start;
    padding:8px 0;border-bottom:1px solid #f1f5f9;gap:10px">
    <span style="font-size:12px;font-weight:700;color:#64748b;flex-shrink:0">${label}</span>
    <span style="font-size:13px;font-weight:700;text-align:right;word-break:break-word;
      ${mono ? "font-family:ui-monospace;font-size:12px;" : ""}">${value}</span>
  </div>`;
}

// ============================================================================
//  STUDENT RESULT — rich profile
// ============================================================================
export function StudentResultView(tsid) {
  const student = db.findStudent(tsid);
  if (!student) return notFound("student", tsid);

  const school = db.findSchool(student.schoolCode);
  const certs  = db.certificatesForStudent(student.tsid);

  const photo = student.photo
    ? `<img src="${student.photo}" alt="${escapeHtml(student.fullname)}"
         style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;
         justify-content:center;font-size:52px;color:#cbd5e1;background:#f8fafc">👤</div>`;

  return `
  ${Navbar("#/search")}
  ${breadcrumb(escapeHtml(student.fullname))}

  <div style="max-width:860px;margin:0 auto;padding:20px 16px 40px">

    <!-- ── Hero profile card ── -->
    <div style="
      background:linear-gradient(135deg,#1B8F3A 0%,#059669 100%);
      border-radius:20px;padding:24px;margin-bottom:20px;
      display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">

      <!-- Photo -->
      <div style="
        width:100px;height:126px;border-radius:12px;
        border:3px solid rgba(255,255,255,.4);
        overflow:hidden;flex-shrink:0;background:#1e3a5f">
        ${photo}
      </div>

      <!-- Core identity -->
      <div style="flex:1;min-width:200px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
          <span style="
            background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);
            color:#a7f3d0;font-size:10.5px;font-weight:800;
            padding:3px 10px;border-radius:99px;letter-spacing:.3px">
            ✓ VERIFIED
          </span>
          ${certs.length ? `<span style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:#fde68a;font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:99px">★ ${certs.length} Certificate${certs.length>1?"s":""}</span>` : ""}
        </div>
        <h1 style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px;line-height:1.2">
          ${escapeHtml(student.fullname)}
        </h1>
        <div style="font-size:12px;font-family:ui-monospace;color:#a7f3d0;
          background:rgba(0,0,0,.2);display:inline-block;padding:3px 10px;
          border-radius:6px;margin-bottom:10px">
          ${escapeHtml(student.tsid)}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${[
            [`📚 ${escapeHtml(student.level||"—")}`,"rgba(255,255,255,.15)","#fff"],
            [`📍 ${escapeHtml(student.region||"—")}`,"rgba(255,255,255,.12)","#a7f3d0"],
            [`${student.gender==="Female"?"♀":"♂"} ${escapeHtml(student.gender||"—")}`,"rgba(255,255,255,.12)","#86efac"],
          ].map(([t,bg,c])=>`
            <span style="background:${bg};color:${c};font-size:11.5px;font-weight:700;
              padding:4px 10px;border-radius:8px">${t}</span>`).join("")}
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
        <button onclick="window.print()" style="
          background:#fff;color:#1B8F3A;border:none;cursor:pointer;
          padding:10px 16px;border-radius:10px;font-size:13px;font-weight:800;
          display:flex;align-items:center;gap:6px">
          🖨️ Print / PDF
        </button>
        <a href="#/search" style="
          background:rgba(255,255,255,.15);color:#fff;text-decoration:none;
          padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;
          display:flex;align-items:center;gap:6px;justify-content:center">
          ← Back
        </a>
      </div>
    </div>

    <!-- ── Detail cards grid ── -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px"
      class="rg-2">

      <!-- Student info -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1B8F3A,#15702c);
          padding:12px 16px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">🎓</span>
          <span style="font-weight:800;font-size:13px;color:#fff">Student Details</span>
        </div>
        <div style="padding:12px 16px">
          ${infoRow("Full Name",        escapeHtml(student.fullname))}
          ${infoRow("Date of Birth",    fmtDate(student.dob))}
          ${infoRow("Gender",           escapeHtml(student.gender||"—"))}
          ${infoRow("Nationality",      escapeHtml(student.nationality||"Tanzanian"))}
          ${infoRow("Current Level",    escapeHtml(student.level||"—"))}
          ${infoRow("Blood Group",      escapeHtml(student.bloodGroup||"—"))}
          ${infoRow("Enrolled",         fmtDate(student.enrollmentDate))}
          ${infoRow("ID Issued",        fmtDate(student.issueDate))}
        </div>
      </div>

      <!-- School info -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#059669,#047857);
          padding:12px 16px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">🏫</span>
          <span style="font-weight:800;font-size:13px;color:#fff">School Details</span>
        </div>
        <div style="padding:12px 16px">
          ${infoRow("School Name",  escapeHtml(student.schoolName))}
          ${infoRow("School Code",  escapeHtml(student.schoolCode), true)}
          ${infoRow("Type",         escapeHtml(school?.type||"—"))}
          ${infoRow("Region",       escapeHtml(student.region))}
          ${infoRow("District",     escapeHtml(student.district))}
          ${infoRow("Ward",         escapeHtml(student.ward||"—"))}
          ${infoRow("Contact",      escapeHtml((school?.contact)||student.schoolContact||"—"))}
          ${school?.email ? infoRow("Email", escapeHtml(school.email)) : ""}
        </div>
      </div>
    </div>

    <!-- Parent + ID card row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px"
      class="rg-2">

      <!-- Parent / Guardian -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);
          padding:12px 16px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">👨‍👩‍👧</span>
          <span style="font-weight:800;font-size:13px;color:#fff">Parent / Guardian</span>
        </div>
        <div style="padding:12px 16px">
          ${infoRow("Name",         escapeHtml(student.parentName||"—"))}
          ${infoRow("Relationship", escapeHtml(student.relationship||"—"))}
          ${infoRow("Phone",        escapeHtml(student.parentPhone||"—"))}
          ${infoRow("NIDA",         escapeHtml(student.parentNida||"—"), true)}
        </div>
      </div>

      <!-- Verification -->
      <div style="
        background:linear-gradient(135deg,#ecfdf5,#d1fae5);
        border:1.5px solid #6ee7b7;border-radius:16px;
        padding:20px;display:flex;flex-direction:column;gap:14px;
        justify-content:center">
        <div style="font-size:36px;text-align:center">🛡️</div>
        <div style="text-align:center">
          <div style="font-weight:800;font-size:14px;color:#065f46;margin-bottom:4px">
            Verified by TSID
          </div>
          <div style="font-size:12px;color:#059669;line-height:1.6">
            This record is authenticated in Tanzania's national student registry.
          </div>
        </div>
        <div style="background:#fff;border-radius:10px;padding:10px 12px;
          font-size:11.5px;color:#065f46;text-align:center;font-weight:600">
          🔗 verify.tsid.go.tz
        </div>
        ${certs.length ? `
          <div style="background:#fff;border-radius:10px;padding:8px 12px;
            text-align:center;font-size:12px;color:#059669;font-weight:700">
            ★ ${certs.length} Official Certificate${certs.length>1?"s":""} on record
          </div>` : ""}
      </div>
    </div>

    <!-- ID Card (print view) -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:12px 20px;border-bottom:1px solid #f1f5f9;
        display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <h3 style="font-size:14px;font-weight:800;color:#0f172a;margin:0">
          🪪 Official TSID Card
        </h3>
        <span style="font-size:11.5px;color:#64748b">Scan QR to verify authenticity</span>
      </div>
      <div class="print-area">
        ${FullIDCardPair(student)}
      </div>
    </div>

  </div>
  ${Footer()}
  `;
}

// ============================================================================
//  SCHOOL RESULT — dashboard profile with showcase
// ============================================================================
export function SchoolResultView(code) {
  const school   = db.findSchool(code);
  if (!school) return notFound("school", code);

  const students = db.findStudentsBySchool(school.code);
  const payments = db.paymentsForSchool(school.code);
  const paid     = payments.filter(p => p.status === "paid");
  const pending  = payments.filter(p => p.status === "pending");
  const revenue  = paid.reduce((s,p) => s+Number(p.amount||0), 0);

  // Level breakdown from students
  const levels = {};
  students.forEach(st => { levels[st.level||"Unknown"] = (levels[st.level||"Unknown"]||0)+1; });

  const levelBars = Object.entries(levels).slice(0,5).map(([lvl, cnt]) => {
    const pct = students.length ? Math.round((cnt/students.length)*100) : 0;
    return `
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:11.5px;
          font-weight:600;margin-bottom:3px">
          <span style="color:#374151">${escapeHtml(lvl)}</span>
          <span style="color:#059669">${cnt}</span>
        </div>
        <div style="background:#f1f5f9;border-radius:99px;height:6px;overflow:hidden">
          <div style="background:linear-gradient(90deg,#059669,#047857);
            height:100%;width:${pct}%;border-radius:99px;
            transition:width .4s ease"></div>
        </div>
      </div>`;
  }).join("");

  return `
  ${Navbar("#/search")}
  ${breadcrumb(escapeHtml(school.name))}

  <div style="max-width:900px;margin:0 auto;padding:20px 16px 40px">

    <!-- ── School hero banner ── -->
    <div style="
      background:linear-gradient(135deg,#1B8F3A 0%,#059669 100%);
      border-radius:20px;padding:28px 24px;margin-bottom:20px">

      <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <!-- School icon -->
        <div style="
          width:72px;height:72px;border-radius:16px;
          background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.3);
          display:flex;align-items:center;justify-content:center;
          font-size:36px;flex-shrink:0">🏫</div>

        <!-- Identity -->
        <div style="flex:1;min-width:180px">
          <div style="margin-bottom:6px;display:flex;gap:6px;flex-wrap:wrap">
            <span style="background:rgba(255,255,255,.15);color:#a7f3d0;
              font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:99px">
              ✓ VERIFIED SCHOOL
            </span>
            <span style="background:rgba(255,255,255,.12);color:#fde68a;
              font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:99px">
              ${escapeHtml(school.type)}
            </span>
          </div>
          <h1 style="font-size:20px;font-weight:900;color:#fff;
            margin-bottom:4px;line-height:1.2">
            ${escapeHtml(school.name)}
          </h1>
          <div style="font-size:12px;color:#a7f3d0;font-family:ui-monospace;
            background:rgba(0,0,0,.2);display:inline-block;
            padding:3px 10px;border-radius:6px;margin-bottom:10px">
            ${escapeHtml(school.code)}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span style="background:rgba(255,255,255,.12);color:#fff;
              font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:8px">
              📍 ${escapeHtml(school.region)}, ${escapeHtml(school.district)}
            </span>
            <span style="background:rgba(255,255,255,.12);color:#a7f3d0;
              font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:8px">
              🎓 ${students.length} Students
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
          <button onclick="window.print()" style="
            background:#fff;color:#1B8F3A;border:none;cursor:pointer;
            padding:10px 16px;border-radius:10px;font-size:13px;font-weight:800">
            🖨️ Print
          </button>
          <a href="#/search" style="
            background:rgba(255,255,255,.15);color:#fff;text-decoration:none;
            padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;
            text-align:center">
            ← Back
          </a>
        </div>
      </div>

      <!-- Tanzania flag colour band -->
      <div style="height:4px;display:flex;border-radius:99px;overflow:hidden;margin-top:20px">
        <div style="background:#1B8F3A;flex:4.5"></div>
        <div style="background:#F5C400;flex:1"></div>
        <div style="background:#000;flex:1"></div>
        <div style="background:#007AFF;flex:3.5"></div>
      </div>
    </div>

    <!-- ── Stats row ── -->
    <div class="rg-4" style="margin-bottom:16px">
      ${[
        ["Total Students", students.length,             "#15702c","#dcfce7","#86efac","🎓"],
        ["Revenue (TZS)",  revenue.toLocaleString(),    "#065f46","#ecfdf5","#6ee7b7","₵"],
        ["Paid Payments",  paid.length,                 "#5b21b6","#f5f3ff","#c4b5fd","✓"],
        ["Pending Fees",   pending.length,              "#92400e","#fffbeb","#fcd34d","⏳"],
      ].map(([label,val,tc,bg,bdr,icon])=>`
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:14px 16px">
          <div style="font-size:11px;font-weight:700;color:${tc};opacity:.75;
            margin-bottom:4px">${icon} ${label}</div>
          <div style="font-size:18px;font-weight:900;color:${tc}">${val}</div>
        </div>`).join("")}
    </div>

    <!-- ── Details + Level breakdown ── -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px"
      class="rg-2">

      <!-- School details -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1B8F3A,#15702c);
          padding:12px 16px;display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">🏛️</span>
          <span style="font-weight:800;font-size:13px;color:#fff">School Profile</span>
        </div>
        <div style="padding:12px 16px">
          ${infoRow("School Code",  escapeHtml(school.code), true)}
          ${infoRow("Type",         escapeHtml(school.type))}
          ${infoRow("Region",       escapeHtml(school.region))}
          ${infoRow("District",     escapeHtml(school.district))}
          ${infoRow("Ward",         escapeHtml(school.ward))}
          ${infoRow("Contact",      escapeHtml(school.contact||"—"))}
          ${school.email   ? infoRow("Email",   escapeHtml(school.email))   : ""}
          ${school.address ? infoRow("Address", escapeHtml(school.address)) : ""}
          ${infoRow("Registered",   fmtDate(school.createdAt))}
        </div>
      </div>

      <!-- Students by level -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#059669,#047857);
          padding:12px 16px;display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">📊</span>
          <span style="font-weight:800;font-size:13px;color:#fff">Students by Level</span>
        </div>
        <div style="padding:14px 16px">
          ${students.length === 0
            ? `<div style="text-align:center;padding:20px;font-size:13px;color:#94a3b8">No students yet.</div>`
            : levelBars}
        </div>
      </div>
    </div>

    <!-- ── Students showcase ── -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid #f1f5f9;
        display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <h3 style="font-size:14px;font-weight:800;color:#0f172a;margin:0">
          🎓 Registered Students
          <span style="font-size:12px;font-weight:600;color:#64748b">(${students.length})</span>
        </h3>
      </div>

      ${students.length === 0
        ? `<div class="empty-state"><div class="ic">📭</div><p>No students registered at this school yet.</p></div>`
        : `<div style="padding:12px 16px;display:flex;flex-direction:column;gap:10px">
            ${students.map(st => {
              const photo = st.photo
                ? `<img src="${st.photo}" style="width:40px;height:50px;object-fit:cover;border-radius:7px;border:1.5px solid #e2e8f0;flex-shrink:0">`
                : `<div style="width:40px;height:50px;border-radius:7px;background:#f1f5f9;border:1.5px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:18px;color:#cbd5e1;flex-shrink:0">👤</div>`;
              return `
                <a href="#/search/result/student/${encodeURIComponent(st.tsid)}"
                  style="text-decoration:none;color:inherit">
                  <div style="
                    display:flex;align-items:center;gap:12px;
                    padding:10px 12px;border-radius:12px;
                    border:1.5px solid #f1f5f9;background:#fafafa;
                    transition:all .15s;cursor:pointer"
                    class="school-student-row">
                    ${photo}
                    <div style="flex:1;min-width:0">
                      <div style="font-weight:800;font-size:13.5px;color:#0f172a;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                        ${escapeHtml(st.fullname)}
                      </div>
                      <div style="font-size:11.5px;color:#64748b;margin-top:1px">
                        ${escapeHtml(st.level||"—")} · ${st.gender||"—"}
                      </div>
                      <div style="font-size:10.5px;color:#94a3b8;font-family:ui-monospace;margin-top:1px">
                        ${escapeHtml(st.tsid)}
                      </div>
                    </div>
                    <div style="flex-shrink:0">
                      <span class="badge green" style="font-size:10px">View ID →</span>
                    </div>
                  </div>
                </a>`;
            }).join("")}
          </div>`}
    </div>

  </div>

  <style>
    .school-student-row:hover {
      border-color:#059669 !important;
      background:#f0fdf4 !important;
    }
  </style>

  ${Footer()}
  `;
}

// ============================================================================
//  Not found
// ============================================================================
function notFound(kind, ref) {
  return `
  ${Navbar("#/search")}
  <div style="max-width:500px;margin:80px auto;text-align:center;padding:0 24px">
    <div style="font-size:64px;opacity:.2;margin-bottom:14px">🔍</div>
    <h1 style="font-size:22px;font-weight:900;color:#0f172a">Not Found</h1>
    <p style="color:#64748b;margin-top:8px;line-height:1.6;font-size:13px">
      No ${escapeHtml(kind)} found matching
      <code style="background:#f1f5f9;padding:2px 8px;border-radius:6px">${escapeHtml(ref)}</code>
    </p>
    <a href="#/search" class="btn btn-primary" style="margin-top:20px">← Back to Search</a>
  </div>
  ${Footer()}`;
}

export function initResultView() {
  initNavbar();
  initCardQRs();
  // Hover effect for school student rows
  document.querySelectorAll(".school-student-row").forEach(row => {
    row.addEventListener("mouseenter", () => {
      row.style.borderColor = "#059669";
      row.style.background  = "#f0fdf4";
    });
    row.addEventListener("mouseleave", () => {
      row.style.borderColor = "#f1f5f9";
      row.style.background  = "#fafafa";
    });
  });
}
