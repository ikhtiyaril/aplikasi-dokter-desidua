import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  KeyRound,
} from "lucide-react-native";

export default function ResetPassword() {
  const navigation = useNavigation();

  // form state
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // show/hide toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Captcha
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10));
    setNum2(Math.floor(Math.random() * 10));
    setCaptchaAnswer("");
  };

  const handleResetPassword = async () => {
    // client-side validation
    if (!email || !oldPassword || !password || !confirmPassword) {
      return Alert.alert("Error", "Semua field wajib diisi");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Password tidak sama");
    }

    if (password.length < 6) {
      return Alert.alert("Error", "Password minimal 6 karakter");
    }

    if (parseInt(captchaAnswer) !== num1 + num2) {
      return Alert.alert("Verifikasi Gagal", "Jawaban captcha salah");
    }

    try {
      // ambil token dari storage (verifyToken middleware membutuhkan header Authorization)
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert(
          "Autentikasi Diperlukan",
          "Silakan login terlebih dahulu untuk mengganti password",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
        return;
      }

      // request ke endpoint yang memakai verifyToken
      const payload = {
        old_password: oldPassword,
        new_password: password,
      };

      const res = await axios.post(`${API_URL}/api/doctor/reset-password`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Berhasil!", "Password Anda telah berhasil diubah", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ]);

      // Reset form
      setEmail("");
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      generateCaptcha();
    } catch (err) {
      console.error("Reset password error:", err.response || err.message || err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan";
      Alert.alert("Gagal", message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-blue-50">
      {/* HEADER */}
      <View className="bg-blue-600 pt-12 pb-8 px-6 rounded-b-3xl">
        <View className="items-center">
          <View className="bg-blue-500 w-20 h-20 rounded-3xl items-center justify-center mb-4">
            <Lock size={40} color="#ffffff" strokeWidth={2} />
          </View>
          <Text className="text-white text-3xl font-bold">Reset Password</Text>
          <Text className="text-blue-100 text-sm mt-2 text-center">
            Buat password baru yang aman untuk akun Anda
          </Text>
        </View>
      </View>

      {/* FORM SECTION */}
      <View className="px-6 mt-6">
        {/* INFO CARD */}
        <View className="bg-blue-100 rounded-2xl p-4 mb-6 flex-row items-start">
          <View className="bg-blue-200 p-2 rounded-lg mr-3">
            <ShieldCheck size={20} color="#2563eb" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-blue-900 font-semibold text-sm mb-1">
              Keamanan Password
            </Text>
            <Text className="text-blue-700 text-xs leading-5">
              Gunakan kombinasi huruf besar, kecil, angka, dan simbol untuk password yang lebih aman
            </Text>
          </View>
        </View>

        {/* EMAIL INPUT */}
        <View className="mb-5">
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-100 p-1.5 rounded-lg mr-2">
              <Mail size={16} color="#2563eb" strokeWidth={2} />
            </View>
            <Text className="text-gray-800 font-semibold text-sm">
              Email
            </Text>
          </View>
          <View className="bg-white border-2 border-blue-200 rounded-2xl flex-row items-center px-4 py-1">
            <Mail size={20} color="#94a3b8" strokeWidth={2} />
            <TextInput
              className="flex-1 ml-3 text-gray-800 py-3"
              placeholder="dokter@example.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* OLD PASSWORD INPUT (NEW) */}
        <View className="mb-5">
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-100 p-1.5 rounded-lg mr-2">
              <KeyRound size={16} color="#2563eb" strokeWidth={2} />
            </View>
            <Text className="text-gray-800 font-semibold text-sm">
              Password Lama
            </Text>
          </View>
          <View className="bg-white border-2 border-blue-200 rounded-2xl flex-row items-center px-4 py-1">
            <Lock size={20} color="#94a3b8" strokeWidth={2} />
            <TextInput
              className="flex-1 ml-3 text-gray-800 py-3"
              placeholder="Masukkan password lama"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
              {showOldPassword ? (
                <EyeOff size={20} color="#94a3b8" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#94a3b8" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View className="mb-5">
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-100 p-1.5 rounded-lg mr-2">
              <KeyRound size={16} color="#2563eb" strokeWidth={2} />
            </View>
            <Text className="text-gray-800 font-semibold text-sm">
              Password Baru
            </Text>
          </View>
          <View className="bg-white border-2 border-blue-200 rounded-2xl flex-row items-center px-4 py-1">
            <Lock size={20} color="#94a3b8" strokeWidth={2} />
            <TextInput
              className="flex-1 ml-3 text-gray-800 py-3"
              placeholder="Minimal 6 karakter"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#94a3b8" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#94a3b8" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* CONFIRM PASSWORD INPUT */}
        <View className="mb-5">
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-100 p-1.5 rounded-lg mr-2">
              <KeyRound size={16} color="#2563eb" strokeWidth={2} />
            </View>
            <Text className="text-gray-800 font-semibold text-sm">
              Ulangi Password
            </Text>
          </View>
          <View className="bg-white border-2 border-blue-200 rounded-2xl flex-row items-center px-4 py-1">
            <Lock size={20} color="#94a3b8" strokeWidth={2} />
            <TextInput
              className="flex-1 ml-3 text-gray-800 py-3"
              placeholder="Masukkan password yang sama"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#94a3b8" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#94a3b8" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* PASSWORD STRENGTH INDICATOR */}
        {password.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-600 text-xs font-medium">
                Kekuatan Password
              </Text>
              <Text
                className={`text-xs font-bold ${
                  password.length >= 8
                    ? "text-green-600"
                    : password.length >= 6
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {password.length >= 8
                  ? "Kuat"
                  : password.length >= 6
                  ? "Sedang"
                  : "Lemah"}
              </Text>
            </View>
            <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${
                  password.length >= 8
                    ? "bg-green-500 w-full"
                    : password.length >= 6
                    ? "bg-yellow-500 w-2/3"
                    : "bg-red-500 w-1/3"
                }`}
              />
            </View>
          </View>
        )}

        {/* CAPTCHA */}
        <View className="bg-white rounded-2xl p-5 mb-6 border-2 border-blue-200">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-2 rounded-lg mr-3">
                <ShieldCheck size={20} color="#2563eb" strokeWidth={2} />
              </View>
              <Text className="text-gray-800 font-semibold">
                Verifikasi Keamanan
              </Text>
            </View>
            <TouchableOpacity
              onPress={generateCaptcha}
              className="bg-blue-100 p-2 rounded-lg"
            >
              <RefreshCw size={18} color="#2563eb" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-center text-gray-600 text-sm mb-2">
              Berapa hasil dari:
            </Text>
            <Text className="text-center text-blue-600 text-3xl font-bold">
              {num1} + {num2} = ?
            </Text>
          </View>

          <TextInput
            className="bg-white border-2 border-blue-300 rounded-xl px-4 py-3 text-center text-gray-800 text-lg font-semibold"
            keyboardType="numeric"
            placeholder="Jawaban Anda"
            placeholderTextColor="#94a3b8"
            value={captchaAnswer}
            onChangeText={setCaptchaAnswer}
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleResetPassword}
          className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center mb-4"
        >
          <Lock size={20} color="#ffffff" strokeWidth={2} />
          <Text className="text-white font-bold text-base ml-2">
            Reset Password
          </Text>
        </TouchableOpacity>

        {/* CANCEL BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-white border-2 border-gray-300 py-4 rounded-2xl mb-8"
        >
          <Text className="text-gray-600 font-semibold text-center">
            Batal
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
