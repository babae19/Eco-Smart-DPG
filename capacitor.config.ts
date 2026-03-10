
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecosmart.app',
  appName: 'EcoSmart',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
