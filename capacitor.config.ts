import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.navikota.app',
  appName: 'NaviKota',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      backgroundMessage: 'NaviKota is tracking your location.',
      backgroundTitle: 'Location Tracking'
    }
  }
};

export default config;
