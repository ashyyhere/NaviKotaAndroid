# NaviKota Android

> A map-guide to Kota, the coaching city — now on Android. Coachings, hostels, food, CBT centres & more, with live GPS tracking and fare estimates.

Android-native version of [NaviKota](https://navikota.pages.dev), built with **Kotlin + Jetpack Compose + osmdroid (OpenStreetMap)**.

---

## Features

- **8 categories** — Coaching, Restaurant, Salon, Shop, CBT Centre, Medical, Hostel & Mess, Area/Landmark — each with a coloured pin
- **Fuzzy search** — search across place names, categories, and notes
- **Category filtering** — toggle categories on/off with bottom chips
- **GPS tracking** — blue dot with accuracy circle, auto-follow
- **Navigation** — straight-line route, walking/auto ETA, fare estimates (Auto / Rapido / Uber)
- **Place details** — photo, status, hours, price, reviews, Google rating
- **Add / Edit / Delete** — full CRUD for places
- **Reviews** — submit and view reviews per place
- **Dark / Light theme** — toggle in settings
- **Home location** — set a default origin for distance calculations
- **Offline tiles** — osmdroid caches map tiles to disk for offline use
- **Export / Import** — backup and restore your data as JSON

## Tech Stack

| Layer | Tech |
|---|---|
| UI | Jetpack Compose + Material 3 |
| Map | osmdroid (OpenStreetMap) |
| Storage | SharedPreferences + Gson |
| Location | FusedLocationProviderClient |
| Images | Coil |
| HTTP | OkHttp (geocoding) |
| Build | Gradle Kotlin DSL, minSdk 26, targetSdk 35 |

## Project Structure

```
app/src/main/java/com/navikota/
├── data/
│   ├── model/          # Place, Review, Category enums
│   ├── repository/     # PlaceRepository (SharedPreferences)
│   └── seed/           # SeedData (116 places baked in)
├── ui/
│   ├── theme/          # Colors, Theme (dark/light)
│   ├── map/            # MapScreen + MapViewModel
│   ├── search/         # SearchOverlay (fuzzy search)
│   ├── detail/         # PlaceDetailSheet (bottom sheet)
│   ├── place/          # AddEditPlaceScreen
│   ├── settings/       # SettingsScreen
│   └── components/     # CategoryChip, SearchBar, PlaceMarker, RouteBadge
├── service/            # LocationService (GPS)
├── util/               # GeoUtils (haversine, fares)
├── MainActivity.kt
└── NaviKotaApp.kt
```

## Building

1. Clone the repo:
   ```sh
   git clone https://github.com/ashyyhere/NaviKotaAndroid.git
   ```
2. Open in Android Studio
3. Sync Gradle
4. Run on device or emulator (minSdk 26)

**Note:** osmdroid map tiles require internet on first load. After that, tiles are cached for offline use.

## Data

All 116 seed places are baked into the APK via `SeedData.kt`. User edits are persisted locally via SharedPreferences. The seed data matches the [web version](https://navikota.pages.dev).

## Credits

- Map data: OpenStreetMap contributors
- Original web app: [NaviKota](https://navikota.pages.dev) by ashyy
- Design inspired by [iitk](https://github.com/ni5arga/iitk)

## License

MIT
