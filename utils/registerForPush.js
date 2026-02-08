import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";
import { API_URL } from "@env";

export async function registerForPushToken(authToken) {
  if (!Device.isDevice) {
    console.log("❌ Push hanya bisa di HP fisik");
    return;
  }

  // Request permission
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("❌ Izin notifikasi ditolak");
    return;
  }

  // Ambil Expo Push Token
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log("📲 Expo Push Token:", token);

  // Kirim ke backend
  await axios.post(
    `${API_URL}/api/notification/register-token`,
    { expo_token: token },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  console.log("✅ Push token dikirim ke backend");
}
