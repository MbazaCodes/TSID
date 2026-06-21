import { Shell } from "../../components/Shell.js";
import { currentSession, db, genTsid, log } from "../../store/db.js";
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

export function SchoolCreateStudentView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const suggestedTsid = genTsid();

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>Create New Student</h1>
        <p>Register a student under <strong>${escapeHtml(school.name)}</strong>. The student's TSID will be issued immediately and the card can be previewed.</p>
      </div>
    </div>

    <div class="tsid-card">
      <form class="tsid-form" id="createStudentForm">

        <fieldset>
          <legend>Student Information</legend>
          <div class="grid-2">
            <div class="group">
              <label>TSID Number</label>
              <input id="tsid" value="${suggestedTsid}" readonly>
            </div>
            <div class="group">
              <label>Full Name *</label>
              <input id="fullname" placeholder="e.g. Juma A. Mwanza" required>
            </div>
          </div>
          <div class="grid-3">
            <div class="group">
              <label>Date of Birth *</label>
              <input id="dob" type="date" required>
            </div>
            <div class="group">
              <label>Gender *</label>
              <select id="gender" required>
                <option value="">— Select —</option>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div class="group">
              <label>Nationality</label>
              <input id="nationality" value="Tanzanian">
            </div>
          </div>
          <div class="group">
            <label>Student Photo</label>
            <div style="display:flex;gap:16px;align-items:flex-start;margin-top:4px">

              <!-- Preview box -->
              <div id="photoPreviewBox" style="
                width:100px;height:128px;border-radius:8px;overflow:hidden;
                border:2px dashed #d1fae5;background:#f0fdf4;
                display:flex;align-items:center;justify-content:center;
                flex-shrink:0;position:relative;cursor:pointer"
                onclick="document.getElementById('studentPhoto').click()">
                <img id="photoPreviewImg" src="" alt="" style="
                  width:100%;height:100%;object-fit:cover;display:none">
                <div id="photoPlaceholder" style="text-align:center;padding:8px">
                  <div style="font-size:28px;color:#6ee7b7">👤</div>
                  <div style="font-size:10px;color:#059669;font-weight:700;margin-top:4px">Click to upload</div>
                </div>
                <button id="photoRemoveBtn" onclick="event.stopPropagation();removePhoto()" style="
                  display:none;position:absolute;top:4px;right:4px;
                  width:20px;height:20px;border-radius:50%;border:none;
                  background:#ef4444;color:#fff;font-size:11px;
                  cursor:pointer;line-height:1;padding:0">✕</button>
              </div>

              <!-- Controls -->
              <div style="flex:1">
                <input type="file" id="studentPhoto" accept="image/*" style="display:none">
                <button type="button" onclick="document.getElementById('studentPhoto').click()" class="btn btn-ghost btn-sm" style="
                  width:100%;margin-bottom:8px;border:1.5px dashed #d1d5db;
                  background:#f9fafb;justify-content:center">
                  📁 Choose Photo
                </button>
                <div style="font-size:11.5px;color:#64748b;line-height:1.6">
                  • Accepted: JPG, PNG, WebP<br>
                  • Max size: 2 MB<br>
                  • Best: passport-style, clear face<br>
                  • Will appear on the ID card
                </div>
                <div id="photoFileName" style="
                  margin-top:8px;font-size:11.5px;font-weight:700;
                  color:#059669;display:none">
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Academic Information</legend>
          <div class="grid-2">
            <div class="group">
              <label>Enrollment Date</label>
              <input id="enrollmentDate" type="date">
            </div>
            <div class="group">
              <label>Current Level</label>
              <input id="level" placeholder="e.g. Standard 4 / Form 2 / Year 1">
            </div>
          </div>
          <div class="grid-2">
            <div class="group">
              <label>Blood Group</label>
              <input id="bloodGroup" placeholder="e.g. O+, A-, B+">
            </div>
            <div class="group">
              <label>Issue Date</label>
              <input id="issueDate" type="date" value="${new Date().toISOString().slice(0,10)}">
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Parent / Guardian</legend>
          <div class="grid-2">
            <div class="group">
              <label>Parent / Guardian Name</label>
              <input id="parentName" placeholder="e.g. Aishatu Juma">
            </div>
            <div class="group">
              <label>Relationship</label>
              <input id="relationship" placeholder="Mother / Father / Guardian">
            </div>
          </div>
          <div class="grid-2">
            <div class="group">
              <label>Parent NIDA</label>
              <input id="parentNida" placeholder="19901234567890123">
            </div>
            <div class="group">
              <label>Parent Phone</label>
              <input id="parentPhone" placeholder="+255 7XX XXX XXX">
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>School Information (auto-filled)</legend>
          <div class="grid-2">
            <div class="group"><label>School Name</label><input value="${escapeHtml(school.name)}" disabled></div>
            <div class="group"><label>School Code</label><input value="${escapeHtml(school.code)}" disabled></div>
          </div>
          <div class="grid-3">
            <div class="group"><label>Region</label><input value="${escapeHtml(school.region)}" disabled></div>
            <div class="group"><label>District</label><input value="${escapeHtml(school.district)}" disabled></div>
            <div class="group"><label>Ward</label><input value="${escapeHtml(school.ward)}" disabled></div>
          </div>
          <div class="group"><label>School Contact</label><input value="${escapeHtml(school.contact)}" disabled></div>
        </fieldset>

        <div style="display:flex;gap:10px">
          <button type="submit" class="btn btn-green">💾 Save & Generate TSID</button>
          <a href="#/school/students" class="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  `;

  return Shell("School", "#/school/create-student", LINKS, html);
}

export function initSchoolCreateStudent() {
  const form = document.getElementById("createStudentForm");
  if (!form) return;

  // ── Photo upload wiring ───────────────────────────────────────────────
  const photoInput  = document.getElementById("studentPhoto");
  const previewImg  = document.getElementById("photoPreviewImg");
  const placeholder = document.getElementById("photoPlaceholder");
  const removeBtn   = document.getElementById("photoRemoveBtn");
  const fileName    = document.getElementById("photoFileName");

  // Expose removePhoto globally for the inline onclick
  window.removePhoto = () => {
    photoInput.value = "";
    previewImg.src = "";
    previewImg.style.display = "none";
    placeholder.style.display = "flex";
    removeBtn.style.display = "none";
    if (fileName) { fileName.textContent = ""; fileName.style.display = "none"; }
  };

  photoInput?.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast("Photo must be under 2 MB.", "error");
      photoInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
      placeholder.style.display = "none";
      removeBtn.style.display = "flex";
      if (fileName) {
        fileName.textContent = "✓ " + file.name;
        fileName.style.display = "block";
      }
    };
    reader.readAsDataURL(file);
  });

  // ── Form submit ───────────────────────────────────────────────────────
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const s = currentSession();
    const school = db.findSchool(s.ref);

    const finalize = (photoData) => {
      const student = {
        tsid:          document.getElementById("tsid").value,
        fullname:      document.getElementById("fullname").value.trim(),
        dob:           document.getElementById("dob").value,
        gender:        document.getElementById("gender").value,
        nationality:   document.getElementById("nationality").value || "Tanzanian",
        schoolName:    school.name,
        schoolCode:    school.code,
        region:        school.region,
        district:      school.district,
        ward:          school.ward,
        schoolContact: school.contact,
        enrollmentDate:document.getElementById("enrollmentDate").value,
        level:         document.getElementById("level").value,
        bloodGroup:    document.getElementById("bloodGroup").value,
        parentName:    document.getElementById("parentName").value,
        parentNida:    document.getElementById("parentNida").value,
        relationship:  document.getElementById("relationship").value,
        parentPhone:   document.getElementById("parentPhone").value,
        issueDate:     document.getElementById("issueDate").value,
        photo:         photoData || "",
        status:        "active",
        remarks:       [],
        credentials: {
          username: document.getElementById("tsid").value,
          password: "student123",
        },
      };

      if (!student.fullname) { toast("Full name is required.", "error"); return; }
      if (!student.dob)      { toast("Date of birth is required.", "error"); return; }
      if (!student.gender)   { toast("Gender is required.", "error"); return; }

      db.saveStudent(student);
      log("student:create", `Created student ${student.tsid} (${student.fullname})`);
      toast("✅ Student created! Redirecting to database…", "success");
      setTimeout(() => { window.location.hash = "#/school/students"; }, 700);
    };

    if (photoInput.files.length) {
      const reader = new FileReader();
      reader.onload = () => finalize(reader.result);
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      finalize("");
    }
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
