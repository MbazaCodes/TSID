import { Shell } from "../../components/Shell.js";
import { currentSession, db, log } from "../../store/db.js";
import { toast } from "../../lib/toast.js";
import { escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/school/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/school/create-student", label: "Create Student", icon: "✚" },
  { href: "#/school/students", label: "Student Database", icon: "☰" },
  { href: "#/school/applications", label: "Applications", icon: "✓" },
  { href: "#/school/payments", label: "Payments", icon: "₵" },
  { href: "#/school/settings", label: "School Settings", icon: "⚙" },
];

export function SchoolSettingsView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>School Settings</h1>
        <p>Update ${escapeHtml(school.name)} details. Changes are saved to the national registry.</p>
      </div>
    </div>

    <div class="tsid-card" style="max-width:780px">
      <form class="tsid-form" id="settingsForm">

        <fieldset>
          <legend>Institution Identity</legend>
          <div class="grid-2">
            <div class="group">
              <label>School Code (read-only)</label>
              <input value="${escapeHtml(school.code)}" disabled>
            </div>
            <div class="group">
              <label>Institution Type</label>
              <select id="type">
                <option ${school.type === "Primary School" ? "selected" : ""}>Primary School</option>
                <option ${school.type === "Secondary School" ? "selected" : ""}>Secondary School</option>
                <option ${school.type === "University / College" ? "selected" : ""}>University / College</option>
                <option ${school.type === "VTC" ? "selected" : ""}>Vocational Training Centre</option>
              </select>
            </div>
          </div>
          <div class="group">
            <label>School Name *</label>
            <input id="name" value="${escapeHtml(school.name)}" required>
          </div>
        </fieldset>

        <fieldset>
          <legend>Location</legend>
          <div class="grid-3">
            <div class="group"><label>Region</label><input id="region" value="${escapeHtml(school.region)}"></div>
            <div class="group"><label>District</label><input id="district" value="${escapeHtml(school.district)}"></div>
            <div class="group"><label>Ward</label><input id="ward" value="${escapeHtml(school.ward)}"></div>
          </div>
          <div class="group"><label>Address</label><input id="address" value="${escapeHtml(school.address || "")}"></div>
        </fieldset>

        <fieldset>
          <legend>Contact &amp; Credentials</legend>
          <div class="grid-2">
            <div class="group"><label>Contact Phone</label><input id="contact" value="${escapeHtml(school.contact)}"></div>
            <div class="group"><label>Email</label><input id="email" type="email" value="${escapeHtml(school.email || "")}"></div>
          </div>
          <div class="grid-2">
            <div class="group"><label>Username</label><input id="username" value="${escapeHtml(school.username)}"></div>
            <div class="group"><label>Password</label><input id="password" value="${escapeHtml(school.password)}"></div>
          </div>
        </fieldset>

        <div style="display:flex;gap:10px">
          <button type="submit" class="btn btn-primary">💾 Save Changes</button>
          <a href="#/school/dashboard" class="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  `;

  return Shell("School", "#/school/settings", LINKS, html);
}

export function initSchoolSettings() {
  const form = document.getElementById("settingsForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const s = currentSession();
    const school = db.findSchool(s.ref);
    const updated = {
      ...school,
      name: document.getElementById("name").value.trim(),
      type: document.getElementById("type").value,
      region: document.getElementById("region").value.trim(),
      district: document.getElementById("district").value.trim(),
      ward: document.getElementById("ward").value.trim(),
      address: document.getElementById("address").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      email: document.getElementById("email").value.trim(),
      username: document.getElementById("username").value.trim(),
      password: document.getElementById("password").value,
    };
    db.saveSchool(updated);
    log("school:update", `Updated details for ${updated.code}`);
    toast("School details updated.", "success");
    setTimeout(() => window.location.reload(), 700);
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
