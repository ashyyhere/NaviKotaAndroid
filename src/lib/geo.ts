import type { LatLng, Place } from "../types";

const R = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;

export function hav(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function fares(km: number): { auto: number; rapido: number; uber: number } {
  const d = Math.max(km, 0.5);
  return {
    auto: Math.max(25, Math.round(d * 12)),
    rapido: Math.max(18, Math.round(15 + d * 8)),
    uber: Math.max(40, Math.round(30 + d * 12))
  };
}

export function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function distHint(p: Place, origin: LatLng | null): string {
  if (!origin) return "Turn on Track location or set Home to see distance & fares.";
  const km = hav(origin.lat, origin.lng, p.lat, p.lng);
  const c = fares(km);
  return `Distance: ${fmtDist(km)} · Auto ₹${c.auto} · Rapido ₹${c.rapido} · Uber ₹${c.uber}`;
}
