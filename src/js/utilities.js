function downloadPNG(){

const card =
document.querySelector(".preview-grid");

html2canvas(card,{
scale:3,
useCORS:true
}).then(canvas=>{

const link =
document.createElement("a");

link.download =
"TSID_CARD.png";

link.href =
canvas.toDataURL();

link.click();

});

}

function clearTSID(){

localStorage.removeItem(
"tsidData"
);

window.location.href =
"form.html";

}

function shareTSID(){

const card =
document.querySelector(".preview-grid");

html2canvas(card,{
scale:3,
useCORS:true
}).then(canvas=>{

canvas.toBlob(async(blob)=>{

const file =
new File(
[blob],
"TSID_CARD.png",
{type:"image/png"}
);

if(navigator.share){

try{

await navigator.share({
title:"TSID Card",
files:[file]
});

}catch(e){}

}

});

});

}
