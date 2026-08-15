export type CatKey =
  | "coaching"
  | "restaurant"
  | "salon"
  | "shop"
  | "testcentre"
  | "medical"
  | "stay"
  | "area";

export interface Review {
  n: string;
  s: number;
  t: string;
  d: string;
}

export interface Place {
  id: string;
  cat: CatKey;
  name: string;
  lat: number;
  lng: number;
  notes?: string;
  hours?: string;
  open?: boolean;
  price?: number;
  rating?: number | null;
  ratingCount?: number;
  reviews?: Review[];
  img?: string;
}

export interface Category {
  label: string;
  color: string;
  letter: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}
