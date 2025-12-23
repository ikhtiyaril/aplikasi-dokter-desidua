import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(()=>{
    const loginCheck = async ()=>{
    const token = await AsyncStorage.getItem('authToken')
    if(token){
      navigation.navigate('Home')
    }
    }
    loginCheck()
  },[])
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
        setError(response.data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.log("Axios Error:", err);
      const serverMessage = err?.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login gagal! Server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN HANDLER
  const handleGoogleLogin = () => {
    const googleUrl = `${API_URL}/api/auth/google`;
    Linking.openURL(googleUrl);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-gray-50"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          
          {/* HEADER WITH MEDICAL ICON */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">🏥</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">Desidua</Text>
            <Text className="text-base text-gray-500 mt-2">Portal Dokter</Text>
          </View>

          {/* LOGIN CARD */}
          <View className="bg-white rounded-3xl shadow-lg px-6 py-8">
            
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Selamat Datang
            </Text>
            <Text className="text-gray-500 mb-6">
              Masuk untuk mengelola layanan dan pasien
            </Text>

            {/* ERROR MESSAGE */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex-row items-start">
                <Text className="text-red-600 text-lg mr-2">⚠️</Text>
                <Text className="text-red-600 flex-1">{error}</Text>
              </View>
            ) : null}

            {/* EMAIL INPUT */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                <Text className="text-lg text-gray-500 mr-2">✉️</Text>
                <TextInput
                  className="flex-1 p-4 text-gray-900"
                  placeholder="dokter@klinikcare.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* PASSWORD INPUT */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
                <Text className="text-lg text-gray-500 mr-2">🔒</Text>
                <TextInput
                  className="flex-1 p-4 text-gray-900"
                  placeholder="Masukkan password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text className="text-lg">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`rounded-xl p-4 mb-4 shadow-sm ${
                loading ? 'bg-blue-400' : 'bg-blue-600'
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-base">
                  Masuk
                </Text>
              )}
            </TouchableOpacity>

            {/* DIVIDER */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-400 text-sm mx-4">atau</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* GOOGLE LOGIN */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 flex-row items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="text-xl mr-2">🔐</Text>
              <Text className="text-gray-700 font-semibold">
                Masuk dengan Google
              </Text>
            </TouchableOpacity>

            {/* REGISTER LINK */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-blue-600 font-semibold">Daftar di sini</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <Text className="text-center text-gray-400 text-xs mt-8">
            © 2025 KlinikCare — All Rights Reserved
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}