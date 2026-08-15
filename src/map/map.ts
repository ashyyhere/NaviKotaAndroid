import L from "leaflet";
import type { Place } from "../types";
import { CATS } from "../categories";
import { state, save, normalize } from "../lib/store";
import { openPanel } from "../ui/ui";

let map: L.Map;
const markers = new Map<string, L.Marker>();
let routeLine: L.Polyline | null = null;
let userMarker: L.CircleMarker | null = null;
let accCircle: L.Circle | null = null;

let onRefresh: () => void = () => {};

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function registerSidebarRefresh(fn: () => void): void {
  onRefresh = fn;
}

export function getMap(): L.Map {
  return map;
}

export function initMap(): L.Map {
  map = L.map("map", {
    zoomControl: true,
    attributionControl: false
  }).setView([25.145, 75.842], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);
  map.zoomControl.setPosition("bottomright");
  map.on("click", onMapClick);
  map.on("dragstart", () => {
    state.following = false;
  });
  return map;
}

function pinIcon(cat: Place["cat"], isHome: boolean): L.DivIcon {
  const html = isHome
    ? `<div class="pin home">★</div>`
    : `<div class="pin" style="background:${CATS[cat]?.color || CATS.shop.color}"><span>${CATS[cat]?.letter || "S"}</span></div>`;
  return L.divIcon({
    className: "leaflet-div-icon",
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 22]
  });
}

function markerFor(p: Place): L.Marker {
  const m = L.marker([p.lat, p.lng], { icon: pinIcon(p.cat, p.id === state.homeId), draggable: false });
  m.on("click", () => openPanel(p));
  m.on("dragend", () => {
    const ll = m.getLatLng();
    p.lat = ll.lat;
    p.lng = ll.lng;
    save();
    onRefresh();
  });
  return m;
}

export function isVisible(p: Place): boolean {
  if (!state.categoryVisible[p.cat]) return false;
  if (state.priceFilter !== "any" && (p.price || 0) !== state.priceFilter) return false;
  if (state.openOnly && p.open === false) return false;
  return true;
}

export function renderAll(): void {
  markers.forEach(m => map.removeLayer(m));
  markers.clear();
  state.pois.forEach(p => {
    const m = markerFor(p);
    markers.set(p.id, m);
    if (isVisible(p)) m.addTo(map);
  });
  onRefresh();
}

export function applyFilters(): void {
  markers.forEach((m, id) => {
    const p = state.pois.find(x => x.id === id);
    if (p && isVisible(p)) {
      if (!map.hasLayer(m)) m.addTo(map);
    } else {
      map.removeLayer(m);
    }
  });
  onRefresh();
}

export function refreshMarkerIcons(): void {
  markers.forEach((m, id) => {
    const p = state.pois.find(x => x.id === id);
    if (p) m.setIcon(pinIcon(p.cat, p.id === state.homeId));
  });
}

export function getMarker(id: string): L.Marker | undefined {
  return markers.get(id);
}

export function hasMarkerLayer(id: string): boolean {
  const m = markers.get(id);
  return !!m && map.hasLayer(m);
}

export function addMarkerLayer(id: string): void {
  const m = markers.get(id);
  if (m && !map.hasLayer(m)) m.addTo(map);
}

export function removeMarkerLayer(id: string): void {
  const m = markers.get(id);
  if (m) map.removeLayer(m);
}

export function removeMarker(id: string): void {
  const m = markers.get(id);
  if (m) map.removeLayer(m);
  markers.delete(id);
}

export function setMarkerIcon(id: string): void {
  const m = markers.get(id);
  const p = state.pois.find(x => x.id === id);
  if (m && p) m.setIcon(pinIcon(p.cat, p.id === state.homeId));
}

export function setAllDraggable(v: boolean): void {
  markers.forEach(m => {
    if (v) m.dragging?.enable();
    else m.dragging?.disable();
  });
}

export function setView(lat: number, lng: number, zoom: number): void {
  map.setView([lat, lng], zoom);
}

export function setCursor(cursor: string): void {
  map.getContainer().style.cursor = cursor;
}

function onMapClick(e: L.LeafletMouseEvent): void {
  if (!state.addMode) return;
  const p = normalize({
    id: "m" + state.markerSeq++,
    cat: "shop",
    name: "New place",
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    notes: ""
  });
  state.pois.push(p);
  const m = markerFor(p);
  markers.set(p.id, m);
  if (isVisible(p)) m.addTo(map);
  save();
  onRefresh();
  openPanel(p);
}

export function openPlace(id: string): void {
  const p = state.pois.find(x => x.id === id);
  if (!p) return;
  setView(p.lat, p.lng, 15);
  openPanel(p);
}

export function setRouteLine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): void {
  removeRouteLine();
  routeLine = L.polyline(
    [
      [a.lat, a.lng],
      [b.lat, b.lng]
    ],
    { color: cssVar("--route"), weight: 3, dashArray: "5 7", opacity: 0.9 }
  ).addTo(map);
}

export function removeRouteLine(): void {
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
}

export function setUserMarker(lat: number, lng: number, acc: number): void {
  const c = cssVar("--route");
  if (!userMarker) {
    userMarker = L.circleMarker([lat, lng], {
      radius: 7,
      color: c,
      weight: 2,
      fillColor: c,
      fillOpacity: 0.9
    }).addTo(map);
    accCircle = L.circle([lat, lng], {
      radius: acc,
      color: c,
      weight: 1,
      fillColor: c,
      fillOpacity: 0.12
    }).addTo(map);
  } else {
    userMarker.setLatLng([lat, lng]);
    accCircle!.setLatLng([lat, lng]).setRadius(acc);
  }
}

export function removeUserMarker(): void {
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  if (accCircle) {
    map.removeLayer(accCircle);
    accCircle = null;
  }
}

export function refreshThemeColors(): void {
  if (routeLine) routeLine.setStyle({ color: cssVar("--route") });
  if (userMarker) {
    userMarker.setStyle({ color: cssVar("--route"), fillColor: cssVar("--route") });
    accCircle?.setStyle({ color: cssVar("--route"), fillColor: cssVar("--route") });
  }
}
