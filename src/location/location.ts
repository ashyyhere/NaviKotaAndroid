import { state } from "../lib/store";
import { getMap, setUserMarker, removeUserMarker } from "../map/map";

let watchId: number | null = null;

const posListeners: Array<(pos: { lat: number; lng: number }) => void> = [];

export function registerPositionListener(fn: (pos: { lat: number; lng: number }) => void): void {
  posListeners.push(fn);
}

export function startTracking(): void {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported in this browser.");
    return;
  }
  watchId = navigator.geolocation.watchPosition(
    onPos,
    err => {
      if (err.code === 1) alert("Location permission denied. Allow location in the browser prompt to use tracking.");
      else alert("Could not get your location: " + err.message);
      stopTracking();
    },
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 }
  );
  state.tracking = true;
  state.following = true;
}

export function stopTracking(): void {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  state.tracking = false;
  state.following = false;
  removeUserMarker();
}

function onPos(pos: GeolocationPosition): void {
  state.userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
  setUserMarker(state.userPos.lat, state.userPos.lng, state.userPos.acc);
  posListeners.forEach(fn => fn({ lat: state.userPos!.lat, lng: state.userPos!.lng }));
  if (state.following) getMap().setView([state.userPos.lat, state.userPos.lng], Math.max(getMap().getZoom(), 15));
}
