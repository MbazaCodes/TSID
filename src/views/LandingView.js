import { Navbar } from "../components/Navbar.js";
import { HeroSection } from "../components/HeroSection.js";
import { Footer } from "../components/Footer.js";

export function LandingView(){

return `

${Navbar()}

${HeroSection()}

<section class="max-w-6xl mx-auto py-16 px-6">

<div class="grid md:grid-cols-3 gap-6">

<div class="bg-white rounded-2xl shadow-lg p-6">
<h3 class="font-bold text-xl">Register</h3>
<p class="mt-2 text-slate-600">
Create student records.
</p>
</div>

<div class="bg-white rounded-2xl shadow-lg p-6">
<h3 class="font-bold text-xl">Generate</h3>
<p class="mt-2 text-slate-600">
Generate TSID cards instantly.
</p>
</div>

<div class="bg-white rounded-2xl shadow-lg p-6">
<h3 class="font-bold text-xl">Print</h3>
<p class="mt-2 text-slate-600">
Download PDF and share.
</p>
</div>

</div>

</section>

${Footer()}

`;

}
