import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
const { API_URL } = Constants.expoConfig.extra;
import { useNavigation } from "@react-navigation/native";

export default function Login() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // LOGIN HANDLER
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");
console.log(`${API_URL}/api/doctor/login`)
      const response = await axios.post(`${API_URL}/api/doctor/login`, {
        email,
        password,
      });

      console.log(response.data)
if (response.data.token) {
        await AsyncStorage.setItem("authToken", response.data.token);
        navigation.replace('Home');
      } else {
        setErrorMessage(res.data.message || 'Terjadi kesalahan');
      }
    

    } catch (err) {
  console.log("Axios Error:", err);

  // Ambil message dari response server, kalau ada
  const serverMessage = err?.response?.data?.message;
  if (serverMessage) {
    setError(serverMessage);
  } else if (err.message) {
    // Error dari network / timeout
    setError(err.message);
  } else {
    setError("Login gagal! Server error.");
  }
}
  };

  // GOOGLE LOGIN HANDLER
  const handleGoogleLogin = () => {
    const googleUrl = `${API_URL}/api/auth/google`;
    Linking.openURL(googleUrl);
  };

  return (
    <View className=" justify-center items-center bg-blue-100 px-6 w-full h-full">
      <View className=" bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
        <Text className="text-3xl font-semibold text-blue-700 text-center mb-4">
          KlinikCare Login
        </Text>

        <Text className="text-center text-gray-600 mb-6">
          Masuk untuk mengelola layanan dan pasien
        </Text>

        {error ? (
          <Text className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center mb-4">
            {error}
          </Text>
        ) : null}

        {/* EMAIL */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Email</Text>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 bg-white"
            placeholder="Masukkan email..."
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* PASSWORD */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Password</Text>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 bg-white"
            placeholder="Masukkan password..."
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 p-3 rounded-lg mb-3"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-medium">Login</Text>
          )}
        </TouchableOpacity>

        {/* GOOGLE LOGIN */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          className="w-full bg-red-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-medium">
            Login with Google
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-xs text-black mt-6">
          Belum punya akun?{" "}
          <Text
            className="text-blue-500"
            onPress={() => navigation.navigate("Register")}
          >
            daftar di sini
          </Text>
        </Text>

        <Text className="text-center text-gray-500 text-xs mt-6">
          © 2025 KlinikCare — All Rights Reserved
        </Text>
      </View>
    </View>
  );
}
