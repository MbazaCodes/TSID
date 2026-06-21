export function initForm() {
  // Expose form handler globally for inline onsubmit
  window.__tsidSubmitForm = function (e) {
    e.preventDefault();

    const photoInput = document.getElementById("studentPhoto");
    const reader = new FileReader();

    reader.onload = function () {
      const data = {
        tsid: document.getElementById("tsid").value,
        fullname: document.getElementById("fullname").value,
        dob: document.getElementById("dob").value,
        gender: document.getElementById("gender").value,
        nationality: document.getElementById("nationality").value,

        schoolName: document.getElementById("schoolName").value,
        schoolId: document.getElementById("schoolId").value,
        region: document.getElementById("region").value,
        district: document.getElementById("district").value,
        ward: document.getElementById("ward").value,
        schoolContact: document.getElementById("schoolContact").value,

        enrollmentDate: document.getElementById("enrollmentDate").value,
        level: document.getElementById("level").value,
        bloodGroup: document.getElementById("bloodGroup").value,

        parentName: document.getElementById("parentName").value,
        parentNida: document.getElementById("parentNida").value,
        relationship: document.getElementById("relationship").value,
        parentPhone: document.getElementById("parentPhone").value,

        issueDate: document.getElementById("issueDate").value,

        photo: reader.result,
      };

      localStorage.setItem("tsidData", JSON.stringify(data));
      window.location.hash = "#/id";
    };

    if (photoInput.files.length) {
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      reader.onload();
    }

    return false;
  };
}
