import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'top.vnfest.map',
  appName: '全国 Galgame 同好会地图',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    url: 'https://www.map.vnfest.top/index.html',
    androidScheme: 'https',
    allowNavigation: [
      'www.map.vnfest.top'
    ]
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
