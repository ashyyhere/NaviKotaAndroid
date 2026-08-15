import type { LatLng, Place } from "../types";
import { IMG_DEFAULT, SEED_IMGS } from "../categories";
import { SEEDS } from "../data/places";

export const STORE_KEY = "kota_map_pois_v3";
export const HOME_KEY = "kota_map_home";
export const THEME_KEY = "navikota.theme";

export const state = {
  pois: [] as Place[],
  homeId: null as string | null,
  categoryVisible: {} as Record<string, boolean>,
  editMode: false,
  addMode: false,
  markerSeq: 1000,
  userPos: null as { lat: number; lng: number; acc: number } | null,
  destination: null as Place | null,
  following: false,
  tracking: false,
  priceFilter: "any" as number | "any",
  openOnly: false,
  selected: null as string | null
};

export function normalize(p: Place): Place {
  p.img = p.img || "";
  p.hours = p.hours || "";
  p.open = p.open !== false;
  p.price = typeof p.price === "number" ? p.price : 0;
  p.rating = typeof p.rating === "number" ? p.rating : null;
  p.ratingCount = p.ratingCount || 0;
  p.reviews = Array.isArray(p.reviews) ? p.reviews : [];
  return p;
}

export function homePoi(): Place | null {
  return state.pois.find(p => p.id === state.homeId) || null;
}

export function originPos(): LatLng | null {
  if (state.userPos) return { lat: state.userPos.lat, lng: state.userPos.lng };
  const hp = homePoi();
  return hp ? { lat: hp.lat, lng: hp.lng } : null;
}

export function save(): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.pois));
}

export function load(): void {
  let stored: Place[] | null = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORE_KEY) || "");
  } catch {
    stored = null;
  }
  if (!Array.isArray(stored) || !stored.length) {
    state.pois = SEEDS.map(s => normalize({ ...s }));
  } else {
    const existing = new Set(stored.map(p => p.id));
    SEEDS.forEach(s => {
      if (!existing.has(s.id)) stored!.push(normalize({ ...s }));
    });
    stored.forEach(normalize);
    state.pois = stored;
  }

  state.homeId = localStorage.getItem(HOME_KEY) || null;

  state.pois.forEach(p => {
    if (!p.img) {
      if (SEED_IMGS[p.id]) p.img = SEED_IMGS[p.id];
      else if (IMG_DEFAULT[p.cat]) p.img = IMG_DEFAULT[p.cat];
    }
  });

  save();
}
