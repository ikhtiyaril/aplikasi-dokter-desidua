import 'dotenv/config';

export default ({ config }) => ({
  ...config,

  name: "Desidua Dokter",
  slug: "Desidua-dokter",
  version: "1.0.0",
  orientation: "portrait",

  icon: "./assets/desidua-dokter.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,

  splash: {
    image: "./assets/desidua-dokter.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  ios: {
    supportsTablet: true,
  },

  android: {
    package: "com.ikhtiyarill.desiduadokter",
    adaptiveIcon: {
      foregroundImage: "./assets/desidua-dokter.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
  },

  web: {
    favicon: "./assets/desidua-dokter.png",
    bundler: "metro",
  },

  extra: {
    API_URL: process.env.API_URL,
    WS_URL: process.env.WS_URL,
     eas: {
        projectId: "403f9e68-1a02-4797-87ea-3509367061be"
      },
  },
});
