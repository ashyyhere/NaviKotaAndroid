import type { Category, Place } from "../types";
import { CATS, PRICE_LBL } from "../categories";
import { HOME_KEY, STORE_KEY, THEME_KEY, homePoi, normalize, originPos, save, state } from "../lib/store";
import { fmtDist, hav } from "../lib/geo";
import { SEEDS } from "../data/places";
import { escapeHtml, stars } from "./html";
import {
  addMarkerLayer,
  applyFilters,
  isVisible,
  openPlace,
  refreshMarkerIcons,
  refreshThemeColors,
  removeMarker,
  removeMarkerLayer,
  renderAll,
  setAllDraggable,
  setCursor,
  setMarkerIcon
} from "../map/map";
import { closeRoute, navigateTo } from "../route/route";
import { startTracking, stopTracking } from "../location/location";

const panel = () => document.getElementById("panel")!;
const palette = () => document.getElementById("palette")!;

/* ---------------- theme ---------------- */

function isDark(): boolean {
  return document.documentElement.getAttribute("data-theme") !== "light";
}

function updateThemeBtn(): void {
  document.getElementById("theme-btn")!.textContent = isDark() ? "☾" : "☀";
}

export function toggleTheme(): void {
  const next = isDark() ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#e9ebef" : "#0b0d10");
  refreshThemeColors();
  updateThemeBtn();
}

/* ---------------- layers / chips ---------------- */

export function renderChips(): void {
  const cont = document.getElementById("layer-chips")!;
  cont.innerHTML = (Object.entries(CATS) as [string, Category][])
    .map(([k, v]) => {
      const n = state.pois.filter(p => p.cat === k).length;
      const on = !!state.categoryVisible[k];
      return `<button class="chip" type="button" data-cat="${k}" aria-pressed="${on}">
        <span class="dot" style="color:${v.color}"></span>
        <span>${v.label}</span><span class="n">${n}</span></button>`;
    })
    .join("");
  document.getElementById("layers-btn")!.querySelector(".n")!.textContent = String(
    Object.keys(CATS).filter(k => state.categoryVisible[k]).length
  );
}

export function toggleCat(k: string): void {
  state.categoryVisible[k] = !state.categoryVisible[k];
  renderChips();
  applyFilters();
}

function setAllCats(v: boolean): void {
  Object.keys(CATS).forEach(k => (state.categoryVisible[k] = v));
  renderChips();
  applyFilters();
}

function toggleLayersSheet(): void {
  document.getElementById("layers")!.classList.contains("open") ? closeLayersSheet() : openLayersSheet();
}

function openLayersSheet(): void {
  document.getElementById("layers")!.classList.add("open");
  document.getElementById("layers-scrim")!.hidden = false;
  document.getElementById("layers-btn")!.setAttribute("aria-expanded", "true");
}

function closeLayersSheet(): void {
  document.getElementById("layers")!.classList.remove("open");
  document.getElementById("layers-scrim")!.hidden = true;
  document.getElementById("layers-btn")!.setAttribute("aria-expanded", "false");
}

/* ---------------- detail panel ---------------- */

const addrCache = new Map<string, Promise<string>>();

function fetchAddress(lat: number, lng: number): Promise<string> {
  const key = lat.toFixed(4) + "," + lng.toFixed(4);
  let p = addrCache.get(key);
  if (!p) {
    p = fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&accept-language=en&lat=${lat}&lon=${lng}`
    )
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("reverse-geocode"))))
      .then(j => (j && j.display_name ? String(j.display_name) : ""))
      .catch(() => "");
    addrCache.set(key, p);
  }
  return p;
}

export function openPanel(p: Place): void {
  state.selected = p.id;
  const el = panel();
  el.hidden = false;
  el.innerHTML = panelHTML(p);
  const addrEl = el.querySelector<HTMLElement>("#loc-addr");
  if (addrEl) {
    fetchAddress(p.lat, p.lng).then(s => {
      if (!addrEl.isConnected) return;
      addrEl.textContent = s || `Full address unavailable · ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
    });
  }
}

export function openAbout(): void {
  state.selected = "about";
  const el = panel();
  el.hidden = false;
  el.innerHTML = aboutHTML();
}

export function closePanel(): void {
  state.selected = null;
  panel().hidden = true;
}

function refreshPanel(): void {
  if (!state.selected || state.selected === "about") return;
  const p = state.pois.find(x => x.id === state.selected);
  if (p) openPanel(p);
}

function locDistHTML(p: Place): string {
  const o = originPos();
  if (!o) return "Enable Track location or set Home to see distance.";
  return `~${fmtDist(hav(o.lat, o.lng, p.lat, p.lng))} from you`;
}

function panelHTML(p: Place): string {
  const catInfo = CATS[p.cat] || CATS.shop;
  const isHome = p.id === state.homeId;
  const opts = (Object.entries(CATS) as [string, Category][])
    .map(([k, v]) => `<option value="${k}" ${p.cat === k ? "selected" : ""}>${v.label}</option>`)
    .join("");
  const priceSel = PRICE_LBL.map((l, i) => `<option value="${i}" ${p.price === i ? "selected" : ""}>${l}</option>`).join("");
  const openSel = `<option value="open" ${p.open ? "selected" : ""}>Open</option><option value="closed" ${
    !p.open ? "selected" : ""
  }>Closed</option>`;
  const imgSrc = p.img || "";
  const status = p.open ? '<span class="open-now">Open now</span>' : '<span class="closed-now">Closed</span>';

  return `
  <div class="p-grip"></div>
  <div class="p-head">
    <div style="flex:1;min-width:0">
      <h2>${escapeHtml(p.name)} ${isHome ? '<span style="color:#ffb454">★</span>' : ""}</h2>
      <div class="kind">${catInfo.label} · ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
    </div>
    <button class="p-close" data-act="close" aria-label="Close">×</button>
  </div>
  <div class="p-body">
    <div class="p-ph">
      ${
        imgSrc
          ? `<img src="${escapeHtml(imgSrc)}" loading="lazy" onerror="this.remove()" alt="${escapeHtml(p.name)}">`
          : `<div class="ph-empty"><span class="ph-letter" style="background:${catInfo.color}">${catInfo.letter}</span> No photo yet — paste an image URL below.</div>`
      }
    </div>
    <div class="status-line">
      <span class="dot ${p.open ? "open" : "closed"}"></span>
      ${status}
      <span class="badge">${PRICE_LBL[p.price ?? 0] || "Free"}</span>
      ${p.hours ? `<span class="badge">${escapeHtml(p.hours)}</span>` : ""}
    </div>
    ${p.rating ? `<div class="google-rate">Google ${stars(p.rating)} ${p.rating.toFixed(1)} (${p.ratingCount ?? 0})</div>` : ""}
    <div class="p-sec">Location</div>
    <div class="loc">
      <div class="loc-addr" id="loc-addr">Looking up address…</div>
      <div class="loc-dist">${escapeHtml(locDistHTML(p))}</div>
    </div>
    <a class="g-link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      p.name + " Kota"
    )}">See listing &amp; reviews on Google ↗</a>

    <div class="p-sec">Edit</div>
    <label class="f">Category</label>
    <select id="ed-cat">${opts}</select>
    <div class="p-two">
      <div><label class="f">Hours</label><input type="text" id="ed-hours" value="${escapeHtml(p.hours ?? "")}" placeholder="e.g. 9:00 AM – 6:30 PM"></div>
      <div><label class="f">Status</label><select id="ed-open">${openSel}</select></div>
    </div>
    <div class="p-two">
      <div><label class="f">Price</label><select id="ed-price">${priceSel}</select></div>
      <div><label class="f">Notes</label></div>
    </div>
    <textarea id="ed-notes">${escapeHtml(p.notes ?? "")}</textarea>
    <label class="f">Image URL</label>
    <input type="text" id="ed-img" value="${escapeHtml(p.img ?? "")}" placeholder="https://…">

    <div class="p-sec">Reviews</div>
    ${reviewsHTML(p)}

    <div class="p-actions">
      <button data-act="nav" data-id="${p.id}">Navigate</button>
      <button class="${isHome ? "on" : ""}" data-act="home" data-id="${p.id}">${isHome ? "★ Home" : "Home"}</button>
      <button data-act="save" data-id="${p.id}">Save</button>
      <button class="danger" data-act="del" data-id="${p.id}">Delete</button>
    </div>
    <div class="moved-hint">${
      state.editMode ? "Drag the pin to reposition it." : "Tip: turn on Drag mode (⌘K) to reposition pins."
    }</div>
  </div>`;
}

function reviewsHTML(p: Place): string {
  const reviews = p.reviews || [];
  let h = "";
  if (reviews.length) {
    const avg = (reviews.reduce((a, r) => a + r.s, 0) / reviews.length).toFixed(1);
    h += `<div class="rev-list"><div class="rev-meta" style="margin:4px 0 2px">Local avg ${avg} ${stars(+avg)}</div>`;
    reviews
      .slice(-6)
      .reverse()
      .forEach(r => {
        h += `<div class="rev"><span class="stars">${stars(r.s)}</span><span class="rev-txt">${escapeHtml(
          r.t
        )}</span><span class="rev-meta">${escapeHtml(r.n)} · ${escapeHtml(r.d)}</span></div>`;
      });
    h += `</div>`;
  } else {
    h += `<div class="rev-empty">No local reviews yet.</div>`;
  }
  h += `<div class="p-two">
    <div><label class="f">Your name</label><input type="text" id="rv-name" placeholder="Anonymous"></div>
    <div><label class="f">Rating</label><select id="rv-stars"><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select></div>
  </div>
  <label class="f">Review</label>
  <input type="text" id="rv-text" placeholder="How was it?">
  <div class="p-actions"><button data-act="review" data-id="${p.id}">Post review</button></div>`;
  return h;
}

function aboutHTML(): string {
  return `
  <div class="p-grip"></div>
  <div class="p-head">
    <div style="flex:1;min-width:0">
      <h2>NaviKota</h2>
      <div class="kind">coaching city · mapped</div>
    </div>
    <button class="p-close" data-act="close" aria-label="Close">×</button>
  </div>
  <div class="p-body">
    <p style="font-size:12.5px;line-height:1.6;color:var(--fg-2);margin:0 0 12px">
      A map-guide to Kota — the coaching city. Coachings, hostels, food, CBT centres &amp; more,
      with live tracking and auto/rapido/uber fares. Seed locations are approximate; use
      <b>Drag mode</b> to fix pin spots. Your edits live in this browser's localStorage.
    </p>
    <div class="p-sec">Actions</div>
    <div class="p-actions">
      <button data-act="track">Track</button>
      <button data-act="add">Add place</button>
      <button data-act="drag">Drag mode</button>
    </div>
    <div class="p-actions">
      <button data-act="export">Export</button>
      <button data-act="import">Import</button>
      <button class="danger" data-act="clear">Reset</button>
    </div>
    <div class="p-sec">Data</div>
    <div class="rev-list">
      <div class="rev"><span class="rev-txt">${state.pois.length} places loaded</span><span class="rev-meta">seeded with real Kota landmarks</span></div>
      <div class="rev"><span class="rev-txt">Basemap</span><span class="rev-meta">© OpenStreetMap contributors</span></div>
    </div>
    <div class="p-sec">About</div>
    <div style="font-size:12px;color:var(--fg-3);line-height:1.7">
      Built by <b>ashyy</b> for Kota's coaching students.<br>
      Basemap &copy; OpenStreetMap contributors.
    </div>
  </div>`;
}

/* ---------------- panel actions ---------------- */

export function handlePanelAction(act: string, id: string): void {
  switch (act) {
    case "close":
      closePanel();
      break;
    case "nav":
      navigateTo(id);
      closePanel();
      break;
    case "home":
      toggleHome(id);
      break;
    case "save":
      savePlace(id);
      break;
    case "del":
      deletePlace(id);
      break;
    case "review":
      addReview(id);
      break;
    case "track":
      toggleTrack();
      closePanel();
      break;
    case "add":
      toggleAddMode();
      closePanel();
      break;
    case "drag":
      toggleDragMode();
      closePanel();
      break;
    case "export":
      exportData();
      break;
    case "import":
      document.getElementById("import-file")!.click();
      break;
    case "clear":
      clearAll();
      break;
  }
}

function savePlace(id: string): void {
  const p = state.pois.find(x => x.id === id);
  if (!p) return;
  p.cat = (document.getElementById("ed-cat") as HTMLSelectElement).value as Place["cat"];
  p.hours = (document.getElementById("ed-hours") as HTMLInputElement).value.trim();
  p.open = (document.getElementById("ed-open") as HTMLSelectElement).value === "open";
  p.price = Number((document.getElementById("ed-price") as HTMLSelectElement).value) || 0;
  p.notes = (document.getElementById("ed-notes") as HTMLTextAreaElement).value.trim();
  p.img = (document.getElementById("ed-img") as HTMLInputElement).value.trim();
  save();
  setMarkerIcon(id);
  if (isVisible(p)) addMarkerLayer(id);
  else removeMarkerLayer(id);
  renderChips();
  openPanel(p);
}

function toggleHome(id: string): void {
  const p = state.pois.find(x => x.id === id);
  if (!p) return;
  state.homeId = state.homeId === id ? null : id;
  if (state.homeId) localStorage.setItem(HOME_KEY, state.homeId);
  else localStorage.removeItem(HOME_KEY);
  refreshMarkerIcons();
  openPanel(p);
}

function deletePlace(id: string): void {
  const p = state.pois.find(x => x.id === id);
  if (p && !confirm(`Delete "${p.name}"?`)) return;
  state.pois = state.pois.filter(x => x.id !== id);
  save();
  if (state.homeId === id) {
    state.homeId = null;
    localStorage.removeItem(HOME_KEY);
  }
  if (state.destination?.id === id) closeRoute();
  removeMarker(id);
  renderChips();
  closePanel();
}

function addReview(id: string): void {
  const p = state.pois.find(x => x.id === id);
  if (!p) return;
  const n = (document.getElementById("rv-name") as HTMLInputElement).value.trim() || "Anonymous";
  const s = Number((document.getElementById("rv-stars") as HTMLSelectElement).value);
  const t = (document.getElementById("rv-text") as HTMLInputElement).value.trim();
  if (!t) return;
  p.reviews = p.reviews || [];
  p.reviews.push({ n, s, t, d: new Date().toISOString().slice(0, 10) });
  save();
  openPanel(p);
}

function clearAll(): void {
  if (!confirm("Remove all map data and restore the default map?")) return;
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(HOME_KEY);
  state.homeId = null;
  state.pois = SEEDS.map(s => normalize({ ...s }));
  save();
  renderAll();
  closePanel();
}

function exportData(): void {
  const blob = new Blob([JSON.stringify({ pois: state.pois, homeId: state.homeId }, null, 2)], {
    type: "application/json"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "kota-map-pois.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file: File): void {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(String(r.result));
      const list = Array.isArray(data) ? data : data.pois || null;
      if (!Array.isArray(list)) throw new Error("bad");
      list.forEach((x: Place) => {
        if (!x.id) x.id = "m" + state.markerSeq++;
      });
      state.pois = state.pois.concat(list.map(normalize));
      if (data && data.homeId) state.homeId = data.homeId;
      save();
      renderAll();
      closePanel();
    } catch {
      alert("Import failed: not a valid export file.");
    }
  };
  r.readAsText(file);
}

/* ---------------- commands ---------------- */

type Cmd = { id: string; label: string; hint: string; run: () => void };

function toggleTrack(): void {
  if (state.tracking) stopTracking();
  else startTracking();
}

function toggleAddMode(): void {
  state.addMode = !state.addMode;
  setCursor(state.addMode ? "crosshair" : "");
}

function toggleDragMode(): void {
  state.editMode = !state.editMode;
  setAllDraggable(state.editMode);
  refreshPanel();
}

function toggleOpenOnly(): void {
  state.openOnly = !state.openOnly;
  applyFilters();
}

function cyclePrice(): void {
  const seq: (number | "any")[] = ["any", 0, 1, 2, 3, 4];
  const i = seq.indexOf(state.priceFilter);
  state.priceFilter = seq[(i + 1) % seq.length];
  applyFilters();
}

function goHome(): void {
  const hp = homePoi();
  if (hp) openPlace(hp.id);
}

function commandList(q: string): Cmd[] {
  const list: Cmd[] = [
    {
      id: "track",
      label: state.tracking ? "Stop tracking" : "Track location",
      hint: "live position",
      run: toggleTrack
    },
    { id: "add", label: state.addMode ? "Exit add mode" : "Add a place", hint: "click the map to drop", run: toggleAddMode },
    { id: "drag", label: state.editMode ? "Drag mode: on" : "Drag mode: off", hint: "reposition pins", run: toggleDragMode },
    { id: "open", label: state.openOnly ? "Only open now ✓" : "Only open now", hint: "hide closed places", run: toggleOpenOnly },
    {
      id: "price",
      label: `Price: ${state.priceFilter === "any" ? "any" : PRICE_LBL[state.priceFilter]}`,
      hint: "free · ₹ · ₹₹ · ₹₹₹ · ₹₹₹₹",
      run: cyclePrice
    },
    {
      id: "theme",
      label: `Theme: ${isDark() ? "dark" : "light"}`,
      hint: `switch to ${isDark() ? "light" : "dark"}`,
      run: () => {
        toggleTheme();
        closePalette();
      }
    }
  ];
  const hp = homePoi();
  if (hp) list.unshift({ id: "home", label: "Go home", hint: hp.name, run: goHome });
  list.push(
    { id: "export", label: "Export data", hint: "download JSON", run: exportData },
    { id: "import", label: "Import data", hint: "load a JSON file", run: () => document.getElementById("import-file")!.click() },
    { id: "clear", label: "Reset map", hint: "restore default data", run: clearAll }
  );
  if (!q) return list;
  return list.filter(c => (c.label + " " + c.hint).toLowerCase().includes(q));
}

/* ---------------- palette ---------------- */

let cmdRuns: Record<string, () => void> = {};
let palRows: HTMLElement[] = [];
let palSelected = 0;

export function openPalette(): void {
  palette().hidden = false;
  const input = document.getElementById("palette-input") as HTMLInputElement;
  input.value = "";
  input.focus();
  renderPalette();
}

export function closePalette(): void {
  palette().hidden = true;
}

function togglePalette(): void {
  palette().hidden ? openPalette() : closePalette();
}

function matches(p: Place, q: string): boolean {
  if (!q) return true;
  const hay = (
    p.name +
    " " +
    (CATS[p.cat]?.label || "") +
    " " +
    (p.notes || "") +
    " " +
    (PRICE_LBL[p.price ?? 0] || "")
  ).toLowerCase();
  return hay.includes(q);
}

function mark(text: string, q: string): string {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q);
  if (i === -1) return text;
  return text.slice(0, i) + "<mark>" + text.slice(i, i + q.length) + "</mark>" + text.slice(i + q.length);
}

function placeRow(p: Place, q: string): string {
  const sub = `${CATS[p.cat]?.label || ""} · ${PRICE_LBL[p.price ?? 0] || "Free"}`;
  const meta = p.open ? '<span class="row-meta open">open</span>' : '<span class="row-meta shut">closed</span>';
  return `<div class="row" data-id="${p.id}" role="option">
    <span class="row-title">${mark(escapeHtml(p.name), q)}</span>
    <span class="row-sub">${escapeHtml(sub)}</span>
    ${meta}
  </div>`;
}

function renderPalette(): void {
  const q = (document.getElementById("palette-input") as HTMLInputElement).value.trim().toLowerCase();
  const t0 = performance.now();
  const res = document.getElementById("palette-results")!;
  const places = state.pois.filter(p => matches(p, q));
  const cmds = commandList(q);
  cmdRuns = {};
  let html = "";
  if (places.length) {
    html += `<div class="grp">Places</div>`;
    places.forEach(p => (html += placeRow(p, q)));
  }
  if (cmds.length) {
    html += `<div class="grp">Commands</div>`;
    cmds.forEach(c => {
      cmdRuns[c.id] = c.run;
      html += `<div class="row" data-cmd="${c.id}"><span class="row-title">${escapeHtml(c.label)}</span><span class="row-sub">${escapeHtml(
        c.hint
      )}</span></div>`;
    });
  }
  if (!places.length && !cmds.length) {
    html += `<div class="empty"><b>No matches.</b><br>Try one of these:<br>
      <code data-q="allen">allen</code><code data-q="kachori">kachori</code>
      <code data-q="cbt">cbt</code><code data-q="hostel">hostel</code></div>`;
  }
  res.innerHTML = html;
  palRows = Array.from(res.querySelectorAll(".row"));
  palSelected = 0;
  document.getElementById("palette-timing")!.textContent =
    Math.max(0, Math.round(performance.now() - t0)) + "ms";
  document.getElementById("palette-count")!.textContent = String(palRows.length);
  setSelected();
}

function setSelected(): void {
  palRows.forEach((r, i) => r.setAttribute("aria-selected", String(i === palSelected)));
  palRows[palSelected]?.scrollIntoView({ block: "nearest" });
}

function clickRow(row: HTMLElement): void {
  const id = row.dataset.id;
  if (id) {
    closePalette();
    openPlace(id);
    return;
  }
  const c = row.dataset.cmd;
  if (c && cmdRuns[c]) cmdRuns[c]();
}

function routeSelected(): void {
  const row = palRows[palSelected];
  if (!row) return;
  const id = row.dataset.id;
  if (id) {
    closePalette();
    navigateTo(id);
  }
}

function onPaletteKeydown(e: KeyboardEvent): void {
  if (palette().hidden) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (palRows.length) palSelected = (palSelected + 1) % palRows.length;
    setSelected();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (palRows.length) palSelected = (palSelected - 1 + palRows.length) % palRows.length;
    setSelected();
  } else if (e.key === "Tab") {
    e.preventDefault();
    routeSelected();
  } else if (e.key === "Enter") {
    e.preventDefault();
    clickRow(palRows[palSelected]);
  }
}

/* ---------------- init ---------------- */

export function initUI(): void {
  updateThemeBtn();

  document.getElementById("brand-btn")!.onclick = () => (state.selected === "about" ? closePanel() : openAbout());
  document.getElementById("open-search")!.onclick = togglePalette;
  document.getElementById("theme-btn")!.onclick = toggleTheme;
  document.getElementById("layers-btn")!.onclick = toggleLayersSheet;
  document.getElementById("layers-scrim")!.onclick = closeLayersSheet;
  document.getElementById("palette-close")!.onclick = closePalette;
  document.getElementById("rb-close")!.onclick = closeRoute;

  const input = document.getElementById("palette-input") as HTMLInputElement;
  input.addEventListener("input", renderPalette);
  input.addEventListener("keydown", onPaletteKeydown);

  document.getElementById("layer-chips")!.addEventListener("click", e => {
    const chip = (e.target as HTMLElement).closest(".chip") as HTMLElement | null;
    if (chip && chip.dataset.cat) toggleCat(chip.dataset.cat);
  });

  document.getElementById("layers")!.addEventListener("click", e => {
    const b = (e.target as HTMLElement).closest("button") as HTMLElement | null;
    if (!b) return;
    if (b.dataset.all === "") setAllCats(true);
    else if (b.dataset.none === "") setAllCats(false);
    else if (b.classList.contains("layers-close")) closeLayersSheet();
  });

  document.getElementById("palette-results")!.addEventListener("click", e => {
    const row = (e.target as HTMLElement).closest(".row") as HTMLElement | null;
    if (row) {
      clickRow(row);
      return;
    }
    const code = (e.target as HTMLElement).closest("code[data-q]") as HTMLElement | null;
    if (code) {
      (document.getElementById("palette-input") as HTMLInputElement).value = code.dataset.q!;
      renderPalette();
      (document.getElementById("palette-input") as HTMLInputElement).focus();
    }
  });

  document.getElementById("import-file")!.addEventListener("change", e => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) importData(input.files[0]);
    input.value = "";
  });

  document.addEventListener("click", e => {
    const el = (e.target as HTMLElement).closest("[data-act]") as HTMLElement | null;
    if (!el || !el.dataset.act) return;
    handlePanelAction(el.dataset.act, el.dataset.id || "");
  });

  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      togglePalette();
      return;
    }
    const target = e.target as HTMLElement;
    const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
    if (!typing && e.key === "/") {
      e.preventDefault();
      openPalette();
      return;
    }
    if (e.key === "Escape") {
      if (!palette().hidden) closePalette();
      else if (!panel().hidden) closePanel();
      else closeLayersSheet();
    }
  });

  renderChips();
}
