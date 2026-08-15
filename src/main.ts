import "./styles.css";
import { load, state } from "./lib/store";
import { CATS } from "./categories";
import { initMap, registerSidebarRefresh, renderAll } from "./map/map";
import { initUI, renderChips } from "./ui/ui";

Object.keys(CATS).forEach(k => (state.categoryVisible[k] = true));

initMap();
registerSidebarRefresh(() => renderChips());
load();
renderAll();
initUI();

document.getElementById("boot")!.classList.add("done");
