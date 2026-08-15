# NaviKota Android

> A map-guide to Kota, the coaching city — now on Android. Coachings, hostels, food, CBT centres & more.

Built with [Capacitor](https://capacitorjs.com) wrapping the [NaviKota web app](https://navikota.pages.dev).

## Features

- **8 categories** — Coaching, Restaurant, Salon, Shop, CBT Centre, Medical, Hostel & Mess, Area/Landmark
- **Fuzzy search** — search across place names, categories, and notes
- **Category filtering** — toggle categories on/off
- **GPS tracking** — live location dot
- **Navigation** — distance, walking/auto ETA, fare estimates (Auto / Rapido / Uber)
- **Place details** — photos, hours, price, reviews, Google rating
- **Add / Edit / Delete** — full CRUD for places
- **Dark / Light theme**
- **Home location** — set a default origin
- **Offline map tiles** — cached after first load
- **Export / Import** — backup and restore as JSON

## Building the APK

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [Android Studio](https://developer.android.com/studio)
- Java 17+

### Steps

```sh
# 1. Clone
git clone https://github.com/ashyyhere/NaviKotaAndroid.git
cd NaviKotaAndroid

# 2. Install dependencies
npm install

# 3. Build web app
npm run build

# 4. Sync to Android
npx cap sync android

# 5. Open in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to finish
2. **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Quick commands

```sh
npm run build        # rebuild web
npx cap sync android # sync web to Android
npx cap open android # open in Android Studio
```

## Tech Stack

| Layer | Tech |
|---|---|
| Web | TypeScript + Leaflet + Vite |
| Native | Capacitor 6 (Android) |
| Map | OpenStreetMap tiles |
| Storage | localStorage |
| GPS | Capacitor Geolocation plugin |

## Project Structure

```
├── src/               # Web app (TypeScript + Leaflet)
├── data/              # Seed places (places.json)
├── android/           # Capacitor Android project (auto-generated)
├── capacitor.config.ts
├── index.html
├── vite.config.ts
└── package.json
```

## Data

All 119 seed places are baked into the web build. User edits are stored in localStorage.

## Credits

- Map data: OpenStreetMap contributors
- Design inspired by [iitk](https://github.com/ni5arga/iitk)

## License

MIT

---

made by ashyy <3
