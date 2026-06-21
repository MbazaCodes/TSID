import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, fmtMoney, escapeHtml } from "../../lib/util.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/student/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/student/id", label: "My ID", icon: "▤" },
  { href: "#/student/certificates", label: "Certificates", icon: "★" },
  { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
  { href: "#/student/payments", label: "Payments", icon: "₵" },
];

export function StudentPaymentsView() {
  const s = currentSession();
  if (!s || s.role !== "student") return redirectLogin();
  const student = db.findStudent(s.ref);
  if (!student) return redirectLogin();

  const payments = db.paymentsForStudent(student.tsid);
  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const totalPaid = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const rows = payments
    .slice()
    .reverse()
    .map(
      (p) => `<tr>
        <td class="mono">${escapeHtml(p.ref)}</td>
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
              ? `<button class="btn btn-green btn-sm" data-pay="${escapeHtml(p.ref)}">Pay Now</button>`
              : `<span style="font-size:11px;color:#64748b">—</span>`
          }
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>My Payments</h1>
        <p>Track and pay ID processing fees and other school charges.</p>
      </div>
    </div>

    <div class="tsid-stat-grid">
      <div class="tsid-stat"><div class="icon green">₵</div><div><div class="label">Total Paid</div><div class="value">${fmtMoney(totalPaid, "TZS")}</div></div></div>
      <div class="tsid-stat"><div class="icon yellow">⏳</div><div><div class="label">Pending Amount</div><div class="value">${fmtMoney(pending.reduce((s,p)=>s+Number(p.amount||0),0), "TZS")}</div></div></div>
      <div class="tsid-stat"><div class="icon blue">☰</div><div><div class="label">Total Transactions</div><div class="value">${payments.length}</div></div></div>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>Payment History</h3>
      </div>
      ${
        payments.length === 0
          ? `<div class="empty-state"><div class="ic">₵</div><p>No payments yet.</p></div>`
          : `<table class="tsid-table">
              <thead><tr><th>Ref</th><th>Purpose</th><th>Amount</th><th>Method</th><th>Paid On</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>`
      }
    </div>
  `;

  return Shell("Student/Parent", "#/student/payments", LINKS, html);
}

export function initStudentPayments() {
  document.querySelectorAll("[data-pay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ref = btn.getAttribute("data-pay");
      const payments = db.getPayments();
      const p = payments.find((x) => x.ref === ref);
      if (!p) return;
      p.status = "paid";
      p.paidAt = new Date().toISOString();
      p.method = p.method || "M-Pesa";
      db.savePayment(p);
      toast("Payment successful! Receipt ref: " + p.ref, "success");
      setTimeout(() => window.location.reload(), 700);
    });
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/student"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
