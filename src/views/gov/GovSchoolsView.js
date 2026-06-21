import { Shell } from "../../components/Shell.js";
import { currentSession, db, genSchoolCode, genCredentialPassword, log } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard",     icon: "▣" },
  { href: "#/gov/students",  label: "Students",      icon: "🎓" },
  { href: "#/gov/schools",   label: "Schools",       icon: "🏫" },
  { href: "#/gov/logs",      label: "Activity Logs", icon: "📋" },
];

export function GovSchoolsView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const schools  = db.getSchools();
  const students = db.getStudents();

  const html = `
    <div style="margin-bottom:20px">
      <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin-bottom:4px">
        🏫 Schools Management
      </h1>
      <p style="font-size:13px;color:#64748b">
        Register new schools and manage all ${schools.length} institutions in the national registry.
      </p>
    </div>

    <!-- Register form -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:18px;
      overflow:hidden;margin-bottom:24px">

      <!-- Form header -->
      <div style="
        background:linear-gradient(135deg,#003366,#059669);
        padding:18px 22px;display:flex;align-items:center;gap:12px">
        <div style="
          width:42px;height:42px;border-radius:12px;
          background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.25);
          display:flex;align-items:center;justify-content:center;font-size:20px;
          flex-shrink:0">🏫</div>
        <div>
          <div style="font-weight:800;font-size:15px;color:#fff">Register New School</div>
          <div style="font-size:12px;color:#a7f3d0;margin-top:1px">
            Issue a school code and admin credentials automatically
          </div>
        </div>
      </div>

      <div style="padding:22px">
        <form class="tsid-form" id="schoolForm">

          <!-- Row 1: Type + Name -->
          <div class="grid-2" style="margin-bottom:0">
            <div class="group">
              <label>Institution Type *</label>
              <select id="type">
                <option>Primary School</option>
                <option>Secondary School</option>
                <option>University / College</option>
                <option>Vocational Training Centre</option>
              </select>
            </div>
            <div class="group">
              <label>School Name *</label>
              <input id="name" required placeholder="e.g. Shule Ya Sekondari Igogo">
            </div>
          </div>

          <!-- Row 2: Location -->
          <div class="grid-3" style="margin-bottom:0">
            <div class="group">
              <label>Region *</label>
              <input id="region" required placeholder="e.g. Mwanza">
            </div>
            <div class="group">
              <label>District</label>
              <input id="district" placeholder="e.g. Ilemela">
            </div>
            <div class="group">
              <label>Ward</label>
              <input id="ward" placeholder="e.g. Igogo">
            </div>
          </div>

          <!-- Row 3: Contact -->
          <div class="grid-2" style="margin-bottom:0">
            <div class="group">
              <label>Contact Phone</label>
              <input id="contact" placeholder="+255 7XX XXX XXX">
            </div>
            <div class="group">
              <label>Email</label>
              <input id="email" type="email" placeholder="school@tsid.go.tz">
            </div>
          </div>

          <!-- Row 4: Credentials -->
          <div style="
            background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;
            padding:14px 16px;margin-bottom:16px">
            <div style="font-size:12px;font-weight:800;color:#065f46;margin-bottom:10px">
              🔑 Admin Credentials (auto-generated)
            </div>
            <div class="grid-3" style="margin-bottom:0">
              <div class="group">
                <label>School Code</label>
                <input id="code" disabled placeholder="Auto: e.g. MW1234"
                  style="background:#fff;font-family:ui-monospace;font-weight:700;color:#003366">
              </div>
              <div class="group">
                <label>Username</label>
                <input id="username" placeholder="e.g. igogosec">
              </div>
              <div class="group">
                <label>Password</label>
                <input id="password" placeholder="Auto-generated"
                  style="font-family:ui-monospace">
              </div>
            </div>
          </div>

          <button type="submit" style="
            width:100%;padding:13px;border-radius:12px;border:none;cursor:pointer;
            background:linear-gradient(135deg,#059669,#047857);
            color:#fff;font-size:14px;font-weight:800;
            display:flex;align-items:center;justify-content:center;gap:8px;
            box-shadow:0 4px 12px rgba(5,150,105,.3)">
            🏫 Register School &amp; Issue Credentials
          </button>
        </form>
      </div>
    </div>

    <!-- Schools table -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:14px 18px;border-bottom:1px solid #f1f5f9;
        display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div style="font-weight:800;font-size:14px;color:#0f172a">
          Registered Schools
          <span style="font-size:12px;font-weight:600;color:#64748b">(${schools.length})</span>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="tsid-table">
          <thead>
            <tr>
              <th>Code</th><th>School</th><th>Region</th>
              <th>Credentials</th><th>Students</th><th>Created</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${schools.map(sc => {
              const cnt = students.filter(st=>st.schoolCode===sc.code).length;
              return `<tr>
                <td class="mono" style="font-size:11.5px;color:#003366;font-weight:800">
                  ${escapeHtml(sc.code)}
                </td>
                <td>
                  <div style="font-weight:700;font-size:13px">${escapeHtml(sc.name)}</div>
                  <div style="font-size:11px;color:#64748b">
                    ${escapeHtml(sc.type)} · ${escapeHtml(sc.district||"")}
                  </div>
                </td>
                <td style="font-size:12.5px">${escapeHtml(sc.region)}</td>
                <td>
                  <div style="font-size:11.5px;font-family:ui-monospace">
                    <span style="color:#374151;font-weight:700">${escapeHtml(sc.username)}</span>
                    <span style="color:#94a3b8"> / </span>
                    <span style="color:#059669;font-weight:700">••••••</span>
                  </div>
                </td>
                <td>
                  <span style="background:#ecfdf5;color:#065f46;font-size:12px;
                    font-weight:800;padding:3px 10px;border-radius:99px">${cnt}</span>
                </td>
                <td style="font-size:12px;color:#64748b">${fmtDate(sc.createdAt)}</td>
                <td><span class="badge green">Active</span></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return Shell("Government", "#/gov/schools", LINKS, html);
}

export function initGovSchools() {
  const regionEl   = document.getElementById("region");
  const nameEl     = document.getElementById("name");
  const codeEl     = document.getElementById("code");
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");

  function autoFill() {
    if (regionEl.value) {
      codeEl.value = regionEl.value.slice(0,2).toUpperCase() + "####  (auto)";
    }
    if (!usernameEl.value && nameEl.value) {
      usernameEl.value = nameEl.value.toLowerCase()
        .replace(/[^a-z0-9]/g,"").slice(0,10);
    }
    if (!passwordEl.value) {
      passwordEl.value = genCredentialPassword();
    }
  }

  regionEl?.addEventListener("input", autoFill);
  nameEl?.addEventListener("input",   autoFill);

  document.getElementById("schoolForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!nameEl.value.trim()) { toast("School name is required.", "error"); return; }
    if (!regionEl.value.trim()) { toast("Region is required.", "error"); return; }

    const btn = e.target.querySelector("button[type=submit]");
    btn.textContent = "Registering…";
    btn.style.opacity = ".7";

    const codeVal = genSchoolCode(regionEl.value);
    const school  = {
      code:      codeVal,
      name:      nameEl.value.trim(),
      type:      document.getElementById("type").value,
      region:    regionEl.value.trim(),
      district:  document.getElementById("district").value.trim(),
      ward:      document.getElementById("ward").value.trim(),
      address:   "",
      contact:   document.getElementById("contact").value.trim(),
      email:     document.getElementById("email").value.trim(),
      username:  (usernameEl.value || nameEl.value.toLowerCase().split(" ")[0]).trim(),
      password:  passwordEl.value || genCredentialPassword(),
      createdAt: new Date().toISOString(),
      status:    "active",
    };

    await db.saveSchool(school);
    log("school:create", `Registered school ${codeVal} (${school.name})`);
    toast(`✅ School registered! Code: ${codeVal}`, "success");
    setTimeout(() => window.location.reload(), 900);
  });
}

function redirectLogin() {
  setTimeout(() => window.location.hash = "#/login/gov", 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting…</p></div>`;
}
