document.addEventListener("DOMContentLoaded", function() {

    const data = JSON.parse(
        localStorage.getItem("tsidData") || "{}"
    );

    function setText(id,value){
        const el = document.getElementById(id);
        if(el && value){
            el.textContent = value;
        }
    }

    if(Object.keys(data).length){

        // FRONT
        setText("cardTidValue",data.tsid);
        setText("fullName",data.fullname);
        setText("dob",data.dob);
        setText("gender",data.gender);
        setText("nationality",data.nationality);

        // BACK
        setText("enrollmentDate",data.enrollmentDate);
        setText("currentLevel",data.level);
        setText("bloodGroup",data.bloodGroup);

        setText("parentName",data.parentName);
        setText("parentNida",data.parentNida);
        setText("relationship",data.relationship);

        setText("issueDate",data.issueDate);

        // School Information
        const schoolBlock =
            document.querySelector(".institution-specs");

        if(schoolBlock){

            schoolBlock.innerHTML =
            `
            SHULE YA MSINGI: <span>${data.schoolName || ""}</span><br>
            SCHOOL ID: <span>${data.schoolId || ""}</span><br>
            REGION: <span>${data.region || ""}</span><br>
            DISTRICT: <span>${data.district || ""}</span><br>
            WARD: <span>${data.ward || ""}</span><br>
            SCHOOL CONTACT: <span>${data.schoolContact || ""}</span>
            `;
        }

        // QR CODE
        const qrContainer =
            document.getElementById("qrcode");

        if(qrContainer){

            qrContainer.innerHTML = "";

            new QRCode(qrContainer,{
                text:
                "https://verify.tsid.go.tz/id/" +
                (data.tsid || ""),

                width:100,
                height:100,
                colorDark:"#000000",
                colorLight:"#ffffff",
                correctLevel:
                QRCode.CorrectLevel.M
            });
        }
    }

});

const tsidDataPhoto =
JSON.parse(
localStorage.getItem("tsidData") || "{}"
);

if(tsidDataPhoto.photo){

const photo =
document.getElementById(
"studentPhotoPreview"
);

if(photo){

photo.src =
tsidDataPhoto.photo;

}

}
