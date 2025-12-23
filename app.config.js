import 'dotenv/config';

export default {
  expo: {
    android: {
      package: "com.ikhtiyarill.myapp",
    },

    extra: {
      API_URL: process.env.API_URL,
      eas: {
        projectId: "0c1ada25-4166-419e-9d91-c37c454445d4",
      },
    },
  },
};
