import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

export function FormView(){

return `

${Navbar()}

<div class="max-w-4xl mx-auto p-6">

<div class="bg-white rounded-3xl shadow-xl p-8">

<h1 class="text-3xl font-black mb-6">
TSID Registration
</h1>

<div id="form-container"></div>

</div>

</div>

${Footer()}

`;

}
