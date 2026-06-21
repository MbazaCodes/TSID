import { LandingView } from "../views/LandingView.js";
import { FormView } from "../views/FormView.js";
import { IDView } from "../views/IDView.js";

export function router(){

```
const path =
    window.location.hash || "#/";

const app =
    document.getElementById("app");

switch(path){

    case "#/create":
        app.innerHTML = FormView();
        break;

    case "#/id":
        app.innerHTML = IDView();
        break;

    default:
        app.innerHTML = LandingView();
}
```

}
