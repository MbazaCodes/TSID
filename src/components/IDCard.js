// ============================================================================
//  Reusable ID card HTML (mini preview + full CR80 layout)
//  Both layouts match the original TSID card design language.
// ============================================================================

import { TZ_COAT_DATA_URI, TZ_FLAG_DATA_URI, escapeHtml } from "../lib/util.js";

// Mini preview card (used in search results & student dashboards)
export function MiniIDCard(student) {
  const photo = student.photo
    ? `<img src="${student.photo}" alt="">`
    : `<span>👤</span>`;
  return `
  <div class="mini-id-card">
    <div class="header">
      <div>
        <div class="tsid">TSID</div>
        <div class="small">Tanzania Student ID</div>
      </div>
      <img src="${TZ_FLAG_DATA_URI}" alt="flag" style="width:30px;height:20px;border-radius:2px">
    </div>
    <div class="body">
      <div class="photo">${photo}</div>
      <div class="info">
        <div class="name">${escapeHtml(student.fullname)}</div>
        <div class="row"><div class="k">TSID No</div><div class="v">${escapeHtml(student.tsid)}</div></div>
        <div class="row"><div class="k">DOB</div><div class="v">${escapeHtml(student.dob || "—")}</div></div>
        <div class="row"><div class="k">Gender</div><div class="v">${escapeHtml(student.gender || "—")}</div></div>
        <div class="row"><div class="k">School</div><div class="v" style="white-space:normal">${escapeHtml(student.schoolName || "—")}</div></div>
      </div>
    </div>
    <div class="footer">
      <div class="seg green"></div>
      <div class="seg yellow"></div>
      <div class="seg black"></div>
      <div class="seg blue"></div>
    </div>
  </div>`;
}

// Full CR80 card preview (front + back) — used by student ID page + search detail
export function FullIDCardPair(student) {
  const data = student || {};
  return `
  <div class="card-preview-body" style="padding:20px 10px">
    <div class="preview-grid">

      <!-- FRONT -->
      <div class="card-column-wrapper">
        <div class="card-direction-label">FRONT</div>
        <div class="tsid-card-canvas front-canvas">
          <header class="front-header">
            <img src="${TZ_COAT_DATA_URI}" class="tz-coat-arms-img" alt="Coat of Arms">
            <div class="header-titles">
              <h1>TSID</h1>
              <p>TANZANIA STUDENT IDENTIFICATION SYSTEM</p>
            </div>
            <img src="${TZ_FLAG_DATA_URI}" class="tz-flag-img" alt="Tanzania Flag">
          </header>

          <div class="front-profile-section">
            <div class="student-photo-frame">
              <img id="studentPhotoPreview" src="${data.photo || "/assets/student.jpg"}" alt="Student Portrait">
            </div>
            <div class="student-identity-fields">
              <div class="field-item">
                <span class="tsid-highlight-lbl">TSID NUMBER</span>
                <span class="tsid-highlight-val" id="cardTidValue">${escapeHtml(data.tsid || "TSID-0000-XXXXXXX")}</span>
              </div>
              <div class="field-item">
                <span class="standard-lbl">FULL NAME</span>
                <span class="standard-val" id="fullName">${escapeHtml((data.fullname || "").toUpperCase())}</span>
              </div>
              <div class="field-item">
                <span class="standard-lbl">DATE OF BIRTH</span>
                <span class="standard-val" id="dob">${escapeHtml(data.dob || "—")}</span>
              </div>
              <div class="field-item">
                <span class="standard-lbl">GENDER</span>
                <span class="standard-val" id="gender">${escapeHtml((data.gender || "—").toUpperCase())}</span>
              </div>
              <div class="field-item">
                <span class="standard-lbl">NATIONALITY</span>
                <span class="standard-val" id="nationality">${escapeHtml((data.nationality || "TANZANIAN").toUpperCase())}</span>
              </div>
            </div>
          </div>

          <div class="front-lower-layout">
            <div class="institution-meta-box">
              <div class="institution-specs">
                SCHOOL: <span>${escapeHtml(data.schoolName || "")}</span><br>
                SCHOOL ID: <span>${escapeHtml(data.schoolCode || "")}</span><br>
                REGION: <span>${escapeHtml(data.region || "")}</span><br>
                DISTRICT: <span>${escapeHtml(data.district || "")}</span><br>
                WARD: <span>${escapeHtml(data.ward || "")}</span><br>
                CONTACT: <span>${escapeHtml(data.schoolContact || "")}</span>
              </div>
            </div>
            <div class="qr-code-wrapper">
              <div class="qr-target-element" data-tsid="${escapeHtml(data.tsid || "")}"></div>
              <div class="qr-caption-text">SCAN TO VERIFY</div>
            </div>
          </div>

          <div class="front-footer-container">
            <div class="front-footer-status-bar">
              <div class="status-badge-node">LIFELONG STUDENT ID</div>
              <div class="status-badge-node">NATIONAL RECOGNIZED</div>
              <div class="status-badge-node">SECURE & VERIFIED</div>
            </div>
            <div class="national-republic-band">
              <div class="color-segment color-green"></div>
              <div class="color-segment color-yellow"></div>
              <div class="color-segment color-black"></div>
              <div class="color-segment color-blue"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- BACK -->
      <div class="card-column-wrapper">
        <div class="card-direction-label">BACK</div>
        <div class="tsid-card-canvas back-canvas back-surface-tint">
          <div class="back-id-header-strip" id="backTsidHeader">
            ${escapeHtml(data.tsid || "TSID-0000-XXXXXXX")}
          </div>
          <div class="back-body-canvas">
            <img src="${TZ_COAT_DATA_URI}" class="back-watermark-crest" alt="Watermark Logo">
            <div class="data-block-segment">
              <div class="segment-title-header">Student Information</div>
              <table class="metadata-table-structure">
                <tr><td class="meta-label-cell">Date of Enrollment</td><td class="meta-value-cell">${escapeHtml(data.enrollmentDate || "—")}</td></tr>
                <tr><td class="meta-label-cell">Current Level</td><td class="meta-value-cell">${escapeHtml(data.level || "—")}</td></tr>
                <tr><td class="meta-label-cell">Blood Group</td><td class="meta-value-cell">${escapeHtml(data.bloodGroup || "—")}</td></tr>
                <tr><td class="meta-label-cell">Phone (Guardian)</td><td class="meta-value-cell">${escapeHtml(data.parentPhone || "—")}</td></tr>
              </table>
            </div>
            <div class="data-block-segment">
              <div class="segment-title-header">Parent / Guardian</div>
              <div class="guardian-split-container">
                <div class="guardian-table-container">
                  <table class="metadata-table-structure" style="margin-bottom:0">
                    <tr><td class="meta-label-cell">Name</td><td class="meta-value-cell">${escapeHtml(data.parentName || "—")}</td></tr>
                    <tr><td class="meta-label-cell">NIDA Number</td><td class="meta-value-cell">${escapeHtml(data.parentNida || "—")}</td></tr>
                    <tr><td class="meta-label-cell">Relationship</td><td class="meta-value-cell">${escapeHtml((data.relationship || "—").toUpperCase())}</td></tr>
                    <tr><td class="meta-label-cell">Phone</td><td class="meta-value-cell">${escapeHtml(data.parentPhone || "—")}</td></tr>
                  </table>
                </div>
                <div class="official-security-stamp">
                  <span class="stamp-top-txt">Tanzania</span>
                  <span class="stamp-center-txt">TSID</span>
                </div>
              </div>
            </div>
            <div class="legal-notice-callout">
              <h4>Important</h4>
              <ul>
                <li>This card is the property of the Government of Tanzania.</li>
                <li>It is valid for educational identification nationwide.</li>
                <li>Report loss of this card to your school immediately.</li>
                <li>This card is not transferable.</li>
              </ul>
            </div>
            <div class="back-verification-footer-row">
              <div class="footnote-data-node">
                <span class="footnote-lbl">Verification Portal</span>
                <span class="footnote-val hyperlink-color">verify.tsid.go.tz</span>
              </div>
              <div class="footnote-data-node alignment-right">
                <span class="footnote-lbl">Issued On</span>
                <span class="footnote-val">${escapeHtml(data.issueDate || "—")}</span>
              </div>
            </div>
          </div>
          <div class="back-base-security-strip">
            <div class="base-disclaimer-text">
              <strong>This card contains secure data.</strong> Unauthorized use is prohibited by law.
            </div>
            <div class="base-government-branding">JAMHURI YA MUUNGANO<br>WA TANZANIA</div>
          </div>
        </div>
      </div>

    </div>
  </div>`;
}

// After rendering a FullIDCardPair, call this to populate QR codes.
export function initCardQRs() {
  if (typeof QRCode === "undefined") return;
  document.querySelectorAll(".qr-target-element").forEach((el) => {
    const tsid = el.getAttribute("data-tsid") || "TSID";
    el.innerHTML = "";
    new QRCode(el, {
      text: "https://verify.tsid.go.tz/id/" + tsid,
      width: 100,
      height: 100,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  });
}
