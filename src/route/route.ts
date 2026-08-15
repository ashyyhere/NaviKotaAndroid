import { state } from "../lib/store";
import { originPos } from "../lib/store";
import { fares, hav } from "../lib/geo";
import { removeRouteLine, setRouteLine, setView } from "../map/map";
import { registerPositionListener, startTracking } from "../location/location";

registerPositionListener(() => {
  if (state.destination) drawRoute();
});

export function navigateTo(id: string): void {
  const p = state.pois.find(x => x.id === id);
  if (!p) return;
  state.destination = p;
  if (!state.tracking) {
    startTracking();
    if (!state.tracking && !originPos()) {
      setBox(p.name, "Enable Track location or set Home to see distance.", "", "");
      showBadge();
      return;
    }
  }
  state.following = true;
  drawRoute();
  const o = originPos();
  if (o) setView(o.lat, o.lng, 15);
  showBadge();
}

export function closeRoute(): void {
  removeRouteLine();
  state.destination = null;
  document.getElementById("route-badge")!.hidden = true;
}

function drawRoute(): void {
  removeRouteLine();
  const o = originPos();
  if (!o || !state.destination) return;
  const dest = state.destination;
  setRouteLine(o, { lat: dest.lat, lng: dest.lng });
  const km = hav(o.lat, o.lng, dest.lat, dest.lng);
  const c = fares(km);
  const minWalk = Math.ceil((km / 4.8) * 60);
  const minDrive = Math.ceil((km / 30) * 60);
  document.getElementById("rb-dest")!.textContent = dest.name;
  document.getElementById("rb-eta")!.innerHTML =
    `~<b>${minWalk}</b> min walk · ~<b>${minDrive}</b> min by auto`;
  document.getElementById("rb-cost")!.textContent = `Auto ₹${c.auto} · Rapido ₹${c.rapido} · Uber ₹${c.uber}`;
  document.getElementById("rb-dist")!.textContent =
    km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
  (document.getElementById("gmaps-link") as HTMLAnchorElement).href =
    `https://www.google.com/maps/dir/?api=1&origin=${o.lat},${o.lng}&destination=${dest.lat},${dest.lng}&travelmode=driving`;
}

function setBox(dest: string, dist: string, eta: string, cost: string): void {
  document.getElementById("rb-dest")!.textContent = dest;
  document.getElementById("rb-eta")!.textContent = eta;
  document.getElementById("rb-cost")!.textContent = cost;
  document.getElementById("rb-dist")!.textContent = dist;
}

function showBadge(): void {
  document.getElementById("route-badge")!.hidden = false;
}
