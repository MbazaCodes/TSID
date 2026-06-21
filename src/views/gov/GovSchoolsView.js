import { Shell } from "../../components/Shell.js";
import { currentSession, db, genSchoolCode, genCredentialPassword, log } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/gov/students", label: "Students Database", icon: "☰" },
  { href: "#/gov/schools", label: "Create School", icon: "✚" },
  { href: "#/gov/logs", label: "Logs", icon: "⌷" },
];

export function GovSchoolsView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const schools = db.getSchools();
  const students = db.getStudents();

  const rows = schools
    .map(
      (sc) => {
        const count = students.filter((st) => st.schoolCode === sc.code).length;
        return `<tr>
          <td class="mono">${escapeHtml(sc.code)}</td>
          <td>
            <div style="font-weight:700">${escapeHtml(sc.name)}</div>
            <div style="font-size:11px;color:#64748b">${escapeHtml(sc.email || "")}</div>
          </td>
          <td>${escapeHtml(sc.type)}</td>
          <td>${escapeHtml(sc.region)}<br><span style="font-size:11px;color:#64748b">${escapeHtml(sc.district)} · ${escapeHtml(sc.ward)}</span></td>
          <td>${escapeHtml(sc.username)}<br><span style="font-size:11px;color:#64748b">${escapeHtml(sc.password)}</span></td>
          <td>${count}</td>
          <td>${fmtDate(sc.createdAt)}</td>
          <td><span class="badge green">Active</span></td>
        </tr>`;
      }
    )
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>Schools &amp; Credentials</h1>
        <p>Register new schools and view credentials issued to school administrators.</p>
      </div>
    </div>

    <div class="tsid-card" style="max-width:820px;margin-bottom:24px">
      <h3>Register New School</h3>
      <form class="tsid-form" id="schoolForm">
        <fieldset>
          <legend>Institution Identity</legend>
          <div class="grid-2">
            <div class="group">
              <label>Institution Type</label>
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
        </fieldset>

        <fieldset>
          <legend>Location</legend>
          <div class="grid-3">
            <div class="group"><label>Region *</label><input id="region" required placeholder="e.g. Mwanza"></div>
            <div class="group"><label>District</label><input id="district" placeholder="e.g. Ilemela"></div>
            <div class="group"><label>Ward</label><input id="ward" placeholder="e.g. Igogo"></div>
          </div>
          <div class="group"><label>Address</label><input id="address" placeholder="Physical address"></div>
        </fieldset>

        <fieldset>
          <legend>Contact</legend>
          <div class="grid-2">
            <div class="group"><label>Contact Phone</label><input id="contact" placeholder="+255 7XX XXX XXX"></div>
            <div class="group"><label>Email</label><input id="email" type="email" placeholder="school@tsid.go.tz"></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Administrator Credentials</legend>
          <p style="font-size:12px;color:#64748b;margin-bottom:10px">
            Generated automatically. The school code is derived from the region prefix.
            Username is suggested from the school name; password is auto-generated.
          </p>
          <div class="grid-3">
            <div class="group"><label>School Code</label><input id="code" placeholder="auto" disabled></div>
            <div class="group"><label>Username</label><input id="username" placeholder="e.g. igogo"></div>
            <div class="group"><label>Password</label><input id="password" placeholder="auto"></div>
          </div>
        </fieldset>

        <button type="submit" class="btn btn-green">🏫 Register School &amp; Issue Credentials</button>
      </form>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>Registered Schools (${schools.length})</h3>
      </div>
      <table class="tsid-table">
        <thead><tr>
          <th>Code</th><th>Name</th><th>Type</th><th>Region</th><th>Credentials (User / Pass)</th><th>Students</th><th>Created</th><th>Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  return Shell("Government", "#/gov/schools", LINKS, html);
}

export function initGovSchools() {
  // Auto-fill code & password when region/username changes
  const region = document.getElementById("region");
  const code = document.getElementById("code");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const name = document.getElementById("name");

  function updateCode() {
    if (region.value) code.value = "(auto: " + region.value.slice(0, 2).toUpperCase() + "####)";
    if (!username.value && name.value) {
      username.value = name.value.toLowerCase().split(" ")[0];
    }
    if (!password.value) password.value = genCredentialPassword();
  }
  region.addEventListener("input", updateCode);
  name.addEventListener("input", updateCode);

  document.getElementById("schoolForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const codeVal = genSchoolCode(region.value);
    const newSchool = {
      code: codeVal,
      name: name.value.trim(),
      type: document.getElementById("type").value,
      region: region.value.trim(),
      district: document.getElementById("district").value.trim(),
      ward: document.getElementById("ward").value.trim(),
      address: document.getElementById("address").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      email: document.getElementById("email").value.trim(),
      username: (username.value || name.value.toLowerCase().split(" ")[0]).trim(),
      password: password.value || genCredentialPassword(),
      createdAt: new Date().toISOString(),
      status: "active",
    };
    db.saveSchool(newSchool);
    log("school:create", `Registered new school ${newSchool.code} (${newSchool.name})`);
    toast("School registered! Code: " + codeVal, "success");
    setTimeout(() => window.location.reload(), 900);
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/gov"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
