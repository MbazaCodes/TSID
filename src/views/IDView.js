import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";
import { ActionButtons } from "../components/ActionButtons.js";

export function IDView(){

return `

${Navbar()}

<div class="max-w-7xl mx-auto p-6">

${ActionButtons()}

<div id="id-card-container"></div>

</div>

${Footer()}

`;

}
