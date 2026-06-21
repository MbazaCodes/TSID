import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

export function LandingView() {
  return `
  ${Navbar()}

  <!-- Hero -->
  <section class="bg-gradient-to-r from-blue-900 to-green-700 text-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h1 class="text-6xl font-black mb-4">TSID</h1>
      <p class="text-xl">Tanzania Student Identification System</p>
      <p class="text-sm opacity-80 mt-2 max-w-2xl mx-auto">
        A national lifelong student ID platform — register students, issue secure
        CR80 ID cards, manage applications & payments, verify identities nationwide.
      </p>
      <div class="mt-6 flex gap-3 justify-center flex-wrap">
        <a href="#/search" class="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold">🔍 Public Search</a>
        <a href="#/create" class="bg-yellow-400 text-blue-900 px-6 py-3 rounded-xl font-bold">Quick Create ID</a>
      </div>
    </div>
  </section>

  <!-- Role selection -->
  <section class="max-w-6xl mx-auto py-14 px-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-black text-blue-900">Choose your role to continue</h2>
      <p class="text-slate-600 text-sm mt-1">Each panel is tailored to its responsibilities.</p>
    </div>

    <div class="role-grid">

      <a href="#/login/school" class="role-card" style="text-decoration:none;color:inherit">
        <div class="ic green">🏫</div>
        <h3>School / College / University</h3>
        <p>Register students and manage your institution's ID lifecycle.</p>
        <ul>
          <li>Create students & generate TSID cards</li>
          <li>Update school details</li>
          <li>Student database with remarks</li>
          <li>Approve student applications</li>
          <li>Check payments</li>
        </ul>
      </a>

      <a href="#/login/gov" class="role-card" style="text-decoration:none;color:inherit">
        <div class=" ic yellow">🏛️</div>
        <h3>Government Staff</h3>
        <p>National oversight of schools, students and activity logs.</p>
        <ul>
          <li>Dashboard overview</li>
          <li>National students database</li>
          <li>Create schools & issue credentials</li>
          <li>System activity logs</li>
        </ul>
      </a>

      <a href="#/login/student" class="role-card" style="text-decoration:none;color:inherit">
        <div class=" ic blue">🎓</div>
        <h3>Student &amp; Parent</h3>
        <p>View, download and request identity documents.</p>
        <ul>
          <li>Dashboard view</li>
          <li>School and other information</li>
          <li>ID page view & PDF download</li>
          <li>My certificates</li>
          <li>Request Utambulisho letter → PDF</li>
          <li>Payments</li>
        </ul>
      </a>

      <a href="#/search" class="role-card" style="text-decoration:none;color:inherit">
        <div class=" ic">🔎</div>
        <h3>Public Search</h3>
        <p>Verify any school or student instantly — no login needed.</p>
        <ul>
          <li>Search school by name/code</li>
          <li>Search student by TSID/name</li>
          <li>Results shown as ID view layouts</li>
        </ul>
      </a>

    </div>
  </section>

  <!-- Feature strip -->
  <section class="max-w-6xl mx-auto py-6 px-6 grid md:grid-cols-3 gap-6 pb-16">
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h3 class="font-bold text-xl text-blue-900">Register</h3>
      <p class="mt-2 text-slate-600 text-sm">Create student records with full academic, parent & guardian info — submitted for approval.</p>
    </div>
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h3 class="font-bold text-xl text-blue-900">Generate</h3>
      <p class="mt-2 text-slate-600 text-sm">Generate TSID CR80 cards instantly with QR verification, photo and Tanzanian national branding.</p>
    </div>
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h3 class="font-bold text-xl text-blue-900">Print</h3>
      <p class="mt-2 text-slate-600 text-sm">Download PDFs of ID cards, certificates and Utambulisho letters with one click.</p>
    </div>
  </section>

  ${Footer()}
  `;
}
