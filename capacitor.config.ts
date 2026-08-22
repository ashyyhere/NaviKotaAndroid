import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.navikota.app',
  appName: 'NaviKota',
  webDir: 'dist',
  server: {
    url: 'https://navikota.pages.dev',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      backgroundMessage: 'NaviKota is tracking your location.',
      backgroundTitle: 'Location Tracking'
    }
  }
};

export default config;
