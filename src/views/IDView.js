import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

export function IDView() {
  return `
${Navbar()}

<div class="card-preview-body">

<div class="control-dashboard">
  <div class="dashboard-text">
    <h2>TSID Print Optimization Engine</h2>
    <p>Vertical CR80 Blueprint Specification Profile (53.98mm x 85.60mm)</p>
  </div>
  <button class="print-trigger-btn" onclick="window.print()">Print Card PDF</button>
</div>

<div class="preview-grid">

  <!-- CARD CONTAINER: FRONT VIEW -->
  <div class="card-column-wrapper">
    <div class="card-direction-label">FRONT</div>
    <div class="tsid-card-canvas front-canvas">

      <header class="front-header">
        <img src="/assets/tanzania-coat.png" class="tz-coat-arms-img" alt="Coat of Arms">
        <div class="header-titles">
          <h1>TSID</h1>
          <p>TANZANIA STUDENT IDENTIFICATION SYSTEM</p>
        </div>
        <img src="/assets/tanzania-flag.png" class="tz-flag-img" alt="Tanzania Flag">
      </header>

      <div class="front-profile-section">
        <div class="student-photo-frame">
          <img id="studentPhotoPreview" src="/assets/student.jpg" alt="Student Portrait">
        </div>

        <div class="student-identity-fields">
          <div class="field-item">
            <span class="tsid-highlight-lbl">TSID NUMBER</span>
            <span class="tsid-highlight-val" id="cardTidValue">TSID-2025-A1234567</span>
          </div>
          <div class="field-item">
            <span class="standard-lbl">FULL NAME</span>
            <span class="standard-val" id="fullName">JUMA A. MWANZA</span>
          </div>
          <div class="field-item">
            <span class="standard-lbl">DATE OF BIRTH</span>
            <span class="standard-val" id="dob">15 MAY 2014</span>
          </div>
          <div class="field-item">
            <span class="standard-lbl">GENDER</span>
            <span class="standard-val" id="gender">MALE</span>
          </div>
          <div class="field-item">
            <span class="standard-lbl">NATIONALITY</span>
            <span class="standard-val" id="nationality">TANZANIAN</span>
          </div>
        </div>
      </div>

      <div class="front-lower-layout">
        <div class="institution-meta-box">
          <div class="institution-title-row">
            <span class="institution-name">SHULE YA MSINGI MWANGA</span>
          </div>
          <div class="institution-specs">
            SHULE YA MSINGI: <span>MWANGA</span><br>
            SCHOOL ID: <span>PS1234</span><br>
            REGION: <span>DAR ES SALAAM</span><br>
            DISTRICT: <span>KINONDONI</span><br>
            WARD: <span>MANYANYA</span><br>
            SCHOOL CONTACT: <span>0782112233</span>
          </div>
        </div>

        <div class="qr-code-wrapper">
          <div class="qr-target-element" id="qrcode"></div>
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

  <!-- CARD CONTAINER: BACK VIEW -->
  <div class="card-column-wrapper">
    <div class="card-direction-label">BACK</div>
    <div class="tsid-card-canvas back-canvas back-surface-tint">

      <div class="back-id-header-strip" id="backTsidHeader">
        TSID-2025-A1234567
      </div>

      <div class="back-body-canvas">
        <img src="/assets/tanzania-coat.png" class="back-watermark-crest" alt="Watermark Logo">

        <div class="data-block-segment">
          <div class="segment-title-header">Student Information</div>
          <table class="metadata-table-structure">
            <tr>
              <td class="meta-label-cell">Date of Enrollment</td>
              <td class="meta-value-cell" id="enrollmentDate">10 JAN 2020</td>
            </tr>
            <tr>
              <td class="meta-label-cell">Current Level</td>
              <td class="meta-value-cell" id="currentLevel">PRIMARY SCHOOL</td>
            </tr>
            <tr>
              <td class="meta-label-cell">Blood Group</td>
              <td class="meta-value-cell" id="bloodGroup">O+</td>
            </tr>
            <tr>
              <td class="meta-label-cell">Phone (Guardian)</td>
              <td class="meta-value-cell" id="guardianPhone">+255 712 345 678</td>
            </tr>
          </table>
        </div>

        <div class="data-block-segment">
          <div class="segment-title-header">Parent / Guardian</div>
          <div class="guardian-split-container">
            <div class="guardian-table-container">
              <table class="metadata-table-structure" style="margin-bottom: 0;">
                <tr>
                  <td class="meta-label-cell">Name</td>
                  <td class="meta-value-cell" id="parentName">AISHATU JUMA</td>
                </tr>
                <tr>
                  <td class="meta-label-cell">NIDA Number</td>
                  <td class="meta-value-cell" id="parentNida">19901234567890123</td>
                </tr>
                <tr>
                  <td class="meta-label-cell">Relationship</td>
                  <td class="meta-value-cell" id="relationship">MOTHER</td>
                </tr>
                <tr>
                  <td class="meta-label-cell">Phone</td>
                  <td class="meta-value-cell" id="parentPhoneDisplay">+255 712 345 678</td>
                </tr>
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
            <span class="footnote-val" id="issueDate">20 MAY 2025</span>
          </div>
        </div>
      </div>

      <div class="back-base-security-strip">
        <div class="base-disclaimer-text">
          <strong>This card contains secure data.</strong> Unauthorized use is prohibited by law.
        </div>
        <div class="base-government-branding">
          JAMHURI YA MUUNGANO<br>WA TANZANIA
        </div>
      </div>

    </div>
  </div>

</div>

</div>

${Footer()}
`;
}
