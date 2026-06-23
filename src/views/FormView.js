import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

export function FormView() {
  return `
${Navbar()}

<div class="max-w-4xl mx-auto p-6">
  <div class="bg-white rounded-3xl shadow-xl p-8">
    <h1 class="text-3xl font-black mb-6">TSID Registration</h1>

    <form id="tsidForm" onsubmit="return window.__tsidSubmitForm(event)">

      <h3 class="text-lg font-bold mt-6 mb-2 text-slate-700">Student Information</h3>

      <input id="tsid" placeholder="TSID Number" required
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="fullname" placeholder="Full Name" required
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="dob" type="date" required
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <select id="gender" required
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">
        <option value="">Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select>

      <input id="nationality" value="Tanzanian"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <h3 class="text-lg font-bold mt-6 mb-2 text-slate-700">School Information</h3>

      <input id="schoolName" placeholder="School Name"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="schoolId" placeholder="School ID"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="region" placeholder="Region"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="district" placeholder="District"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="ward" placeholder="Ward"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="schoolContact" placeholder="School Contact"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <h3 class="text-lg font-bold mt-6 mb-2 text-slate-700">Student Academic Information</h3>

      <input id="enrollmentDate" type="date"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="level" placeholder="Current Level"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="bloodGroup" placeholder="Blood Group"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <h3 class="text-lg font-bold mt-6 mb-2 text-slate-700">Parent / Guardian</h3>

      <input id="parentName" placeholder="Parent Name"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="parentNida" placeholder="Parent NIDA"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="relationship" placeholder="Relationship"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <input id="parentPhone" placeholder="Parent Phone"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <h3 class="text-lg font-bold mt-6 mb-2 text-slate-700">Student Photo</h3>

      <input type="file" id="studentPhoto" accept="image/*"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <h3 class="text-lg font-bold mt-6 mb-2 text-slate-700">Card Information</h3>

      <input id="issueDate" type="date"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg">

      <button type="submit"
        class="mt-6 w-full p-4 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 cursor-pointer border-none">
        Generate TSID Card
      </button>

    </form>
  </div>
</div>

${Footer()}
`;
}
