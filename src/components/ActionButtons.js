export function ActionButtons(){

return `

<div class="flex flex-wrap gap-3">

<button
onclick="window.print()"
class="bg-blue-900 text-white px-5 py-3 rounded-xl font-bold">
Download PDF
</button>

<button
onclick="window.location.hash='#/'"
class="bg-slate-700 text-white px-5 py-3 rounded-xl font-bold">
Home
</button>

<button
onclick="window.location.hash='#/create'"
class="bg-amber-500 text-white px-5 py-3 rounded-xl font-bold">
New Registration
</button>

<button
onclick="shareTSID()"
class="bg-green-700 text-white px-5 py-3 rounded-xl font-bold">
Share
</button>

</div>

`;

}
