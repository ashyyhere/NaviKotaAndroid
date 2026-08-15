import type { CatKey, Category } from "./types";

export const CATS: Record<CatKey, Category> = {
  coaching: { label: "Coaching", color: "#c5a3e8", letter: "C" },
  restaurant: { label: "Restaurant", color: "#e6977f", letter: "R" },
  salon: { label: "Salon", color: "#93d4bd", letter: "H" },
  shop: { label: "Shop", color: "#8fb3e0", letter: "S" },
  testcentre: { label: "CBT Centre", color: "#d9a7cd", letter: "T" },
  medical: { label: "Medical", color: "#e07b8a", letter: "M" },
  stay: { label: "Hostel & Mess", color: "#aab0e8", letter: "B" },
  area: { label: "Area / Landmark", color: "#8b93a1", letter: "A" }
};

export const PRICE_LBL = ["Free", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];

export const cm = (file: string): string =>
  "https://commons.wikimedia.org/wiki/Special:FilePath/" +
  encodeURIComponent(file.replace(/ /g, "_")) +
  "?width=640";

export const SEED_IMGS: Record<string, string> = {
  s4: cm("Kota Railway station.jpg"),
  s5: cm("Kishore-Sagar-Lake kota.jpg"),
  s7: cm("Chambal-Garden-Kota.jpeg"),
  s8: cm("Seven wonders.jpg"),
  s17: cm("Kishore Sagar, Jag mandir.jpg"),
  s18: cm("Chambal River meander.jpg"),
  s39: cm("Kota Kachori.jpg"),
  s40: cm("Kota Kachori.jpg"),
  s41: cm("Kota Kachori.jpg"),
  s48: cm("North indian thali at a restaurant.jpg"),
  s1: cm("Kota City of Rajasthan View.jpg"),
  s13: cm("Kota City of Rajasthan View.jpg")
};

export const IMG_DEFAULT: Partial<Record<CatKey, string>> = {
  restaurant: cm("North indian thali at a restaurant.jpg"),
  area: cm("Kota City of Rajasthan View.jpg")
};
