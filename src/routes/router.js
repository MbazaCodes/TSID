import { LandingView } from "../views/LandingView.js";
import { FormView } from "../views/FormView.js";
import { IDView } from "../views/IDView.js";
import { initForm } from "../js/form.js";
import { initCard } from "../js/script.js";

export function router() {
  const path = window.location.hash || "#/";
  const app = document.getElementById("app");

  switch (path) {
    case "#/create":
      app.innerHTML = FormView();
      initForm();
      break;

    case "#/id":
      app.innerHTML = IDView();
      initCard();
      break;

    default:
      app.innerHTML = LandingView();
  }
}
