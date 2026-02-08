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
  Image,
  Dimensions
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Stethoscope, 
  Activity, 
  HeartPulse, 
  AlertCircle 
} from "lucide-react-native";

const { API_URL } = Constants.expoConfig.extra;
const { width, height } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loginCheck = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        navigation.navigate('Home');
      }
    };
    loginCheck();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/api/doctor/login`, {
        email,
        password,
      });

      if (response.data.token) {
        await AsyncStorage.setItem("authToken", response.data.token);
        navigation.replace('Home');
      } else {
        setError(response.data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || err.message || "Login gagal!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">

      {/* ==== PURE RN BACKGROUND (PSEUDO GRADIENT) ==== */}
      <View className="absolute w-full h-full bg-[#F0F9FF]" />
      <View className="absolute w-full h-2/3 top-0 bg-[#DBEAFE] opacity-60" />
      <View className="absolute w-full h-1/3 bottom-0 bg-[#EFF6FF] opacity-70" />

      {/* BACKGROUND DECORATION */}
      <View className="absolute w-full h-full overflow-hidden pointer-events-none">
        <View className="absolute -top-10 -right-20 opacity-[0.05]">
          <Stethoscope size={300} color="#2563EB" />
        </View>
        <View className="absolute bottom-20 -left-10 opacity-[0.05]">
          <Activity size={250} color="#2563EB" />
        </View>
        <View className="absolute top-1/3 left-10 opacity-[0.03]">
          <HeartPulse size={100} color="#2563EB" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-8">

            {/* HEADER */}
            <View className="items-center mb-10">
              <View className="shadow-xl shadow-blue-200">
                <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-4 border border-blue-50">
                  <Image
                    source={require('../assets/Desi-Dua-Emas.png')}
                    className="w-16 h-16"
                    resizeMode="contain"
                  />
                </View>
              </View>
              <Text className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Desidua
              </Text>
              <Text className="text-sm font-medium text-blue-600 mt-1 uppercase tracking-widest">
                Portal Dokter
              </Text>
            </View>

            {/* LOGIN CARD */}
            <View className="bg-white/90 rounded-[32px] shadow-2xl shadow-blue-900/10 px-6 py-8 border border-white">

              <Text className="text-xl font-bold text-slate-800 mb-1">
                Selamat Datang Kembali
              </Text>
              <Text className="text-slate-500 mb-8 text-sm">
                Silakan masuk ke akun profesional Anda
              </Text>

              {error && (
                <View className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex-row items-center">
                  <AlertCircle size={20} color="#DC2626" style={{ marginRight: 10 }} />
                  <Text className="text-red-600 text-sm font-medium flex-1">
                    {error}
                  </Text>
                </View>
              )}

              {/* EMAIL */}
              <View className="mb-5">
                <Text className="text-slate-700 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">
                  Email Profesional
                </Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 h-14">
                  <Mail size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 px-3 text-slate-800 text-base font-medium"
                    placeholder="nama@klinik.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View className="mb-8">
                <Text className="text-slate-700 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">
                  Kata Sandi
                </Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 h-14">
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 px-3 text-slate-800 text-base font-medium"
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    {showPassword ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#64748B" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
                className="bg-blue-600 rounded-2xl h-14 items-center justify-center shadow-lg shadow-blue-500/30"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg tracking-wide">
                    Masuk Portal
                  </Text>
                )}
              </TouchableOpacity>

            </View>

            {/* FOOTER */}
            <View className="mt-10 items-center">
              <Text className="text-slate-400 text-xs">
                © 2025 KlinikCare System
              </Text>
              <Text className="text-slate-300 text-[10px] mt-1">
                v.2.0.1 Secure Build
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
