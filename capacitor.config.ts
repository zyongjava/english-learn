import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xinqihang.english',
  appName: '新启航英语',
  webDir: 'dist',
  plugins: {
    TextToSpeech: {
      lang: 'en-US',
      rate: 0.8,
      pitch: 1.0,
    },
  },
};

export default config;
