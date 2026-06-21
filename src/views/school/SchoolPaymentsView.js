import { Shell } from "../../components/Shell.js";
import { currentSession, db, genPaymentRef, log } from "../../store/db.js";
import { fmtDate, fmtMoney, escapeHtml } from "../../lib/util.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/school/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/school/create-student", label: "Create Student", icon: "✚" },
  { href: "#/school/students", label: "Student Database", icon: "☰" },
  { href: "#/school/applications", label: "Applications", icon: "✓" },
  { href: "#/school/payments", label: "Payments", icon: "₵" },
  { href: "#/school/settings", label: "School Settings", icon: "⚙" },
];

export function SchoolPaymentsView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const payments = db.paymentsForSchool(school.code);
  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const totalCollected = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalPending = pending.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const rows = payments
    .slice()
    .reverse()
    .map(
      (p) => `<tr>
        <td class="mono">${escapeHtml(p.ref)}</td>
        <td>
          <div style="font-weight:700">${escapeHtml(p.studentName)}</div>
          <div style="font-size:11px;color:#64748b">${escapeHtml(p.tsid)}</div>
        </td>
        <td>${escapeHtml(p.purpose || "ID Card Processing")}</td>
        <td>${fmtMoney(p.amount, p.currency)}</td>
        <td>${escapeHtml(p.method || "—")}</td>
        <td>${p.paidAt ? fmtDate(p.paidAt) : "—"}</td>
        <td>
          ${
            p.status === "paid"
              ? `<span class="badge green">Paid</span>`
              : `<span class="badge yellow">Pending</span>`
          }
        </td>
        <td>
          ${
            p.status === "pending"
              ? `<button class="btn btn-green btn-sm" data-mark="${escapeHtml(p.ref)}">Mark Paid</button>`
              : `<span style="font-size:11px;color:#64748b">—</span>`
          }
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>Payments</h1>
        <p>Track ID card processing payments for ${escapeHtml(school.name)}.</p>
      </div>
      <button class="btn btn-primary" id="addPaymentBtn">+ Record Payment</button>
    </div>

    <div class="tsid-stat-grid">
      <div class="tsid-stat"><div class="icon green">₵</div><div><div class="label">Collected</div><div class="value">${fmtMoney(totalCollected, "TZS")}</div></div></div>
      <div class="tsid-stat"><div class="icon yellow">⏳</div><div><div class="label">Pending</div><div class="value">${fmtMoney(totalPending, "TZS")}</div></div></div>
      <div class="tsid-stat"><div class="icon blue">☰</div><div><div class="label">Total Payments</div><div class="value">${payments.length}</div></div></div>
      <div class="tsid-stat"><div class="icon red">!</div><div><div class="label">Pending Count</div><div class="value">${pending.length}</div></div></div>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>All Payments</h3>
        <span style="font-size:12px;color:#64748b">${payments.length} records</span>
      </div>
      ${
        payments.length === 0
          ? `<div class="empty-state"><div class="ic">₵</div><p>No payments recorded yet.</p></div>`
          : `<table class="tsid-table">
              <thead><tr>
                <th>Ref</th><th>Student</th><th>Purpose</th><th>Amount</th><th>Method</th><th>Paid On</th><th>Status</th><th>Action</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>`
      }
    </div>

    <!-- Add payment modal -->
    <div id="payModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;align-items:center;justify-content:center">
      <div style="background:#fff;border-radius:14px;padding:24px;width:90%;max-width:520px">
        <h3 style="font-size:16px;font-weight:800;color:#003860;margin-bottom:14px">Record Payment</h3>
        <form class="tsid-form" id="payForm">
          <div class="group">
            <label>Student</label>
            <select id="payStudent" required>
              <option value="">— Select student —</option>
              ${db
                .findStudentsBySchool(school.code)
                .map(
                  (st) =>
                    `<option value="${escapeHtml(st.tsid)}">${escapeHtml(st.fullname)} · ${escapeHtml(st.tsid)}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="grid-2">
            <div class="group"><label>Amount (TZS)</label><input id="payAmount" type="number" value="5000" min="0" required></div>
            <div class="group"><label>Method</label>
              <select id="payMethod">
                <option>M-Pesa</option><option>Tigo Pesa</option><option>Airtel Money</option><option>Bank Transfer</option><option>Cash</option>
              </select>
            </div>
          </div>
          <div class="group"><label>Purpose</label><input id="payPurpose" value="ID Card Processing"></div>
          <div class="group"><label>Status</label>
            <select id="payStatus">
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" id="payCancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;

  return Shell("School", "#/school/payments", LINKS, html);
}

export function initSchoolPayments() {
  const s = currentSession();
  const school = db.findSchool(s.ref);
  const modal = document.getElementById("payModal");

  document.getElementById("addPaymentBtn")?.addEventListener("click", () => {
    modal.style.display = "flex";
  });
  document.getElementById("payCancel")?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.getElementById("payForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const tsid = document.getElementById("payStudent").value;
    const student = db.findStudent(tsid);
    if (!student) {
      toast("Select a valid student.", "error");
      return;
    }
    const payment = {
      ref: genPaymentRef(),
      tsid,
      schoolCode: school.code,
      studentName: student.fullname,
      amount: Number(document.getElementById("payAmount").value),
      currency: "TZS",
      purpose: document.getElementById("payPurpose").value,
      method: document.getElementById("payMethod").value,
      status: document.getElementById("payStatus").value,
      paidAt: document.getElementById("payStatus").value === "paid" ? new Date().toISOString() : null,
    };
    db.savePayment(payment);
    log("payment:record", `Recorded payment ${payment.ref} for ${student.fullname}`);
    toast("Payment recorded.", "success");
    modal.style.display = "none";
    setTimeout(() => window.location.reload(), 700);
  });

  // Mark pending as paid
  document.querySelectorAll("[data-mark]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ref = btn.getAttribute("data-mark");
      const payments = db.getPayments();
      const p = payments.find((x) => x.ref === ref);
      if (!p) return;
      p.status = "paid";
      p.paidAt = new Date().toISOString();
      db.savePayment(p);
      log("payment:markPaid", `Marked payment ${ref} as paid`);
      toast("Marked as paid.", "success");
      setTimeout(() => window.location.reload(), 600);
    });
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
