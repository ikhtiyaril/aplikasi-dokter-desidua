import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";
import {
  User,
  Phone,
  Stethoscope,
  FileText,
  GraduationCap,
  Lock,
  Save,
  Mail,
  MapPin,
} from "lucide-react-native";

export default function General() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    bio: "",
    Study: "",
    isActive: false,
  });

  // ==========================
  // GET DATA DOCTOR
  // ==========================
  const fetchDoctor = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const res = await axios.get(`${API_URL}/api/doctor/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.data;
      setDoctorId(data.id);

      setForm({
        name: data.name || "",
        phone: data.phone || "",
        specialization: data.specialization || "",
        bio: data.bio || "",
        Study: data.Study ? JSON.stringify(data.Study) : "",
        isActive: data.isActive,
      });
    } catch (err) {
      Alert.alert("Error", "Gagal mengambil data dokter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  // ==========================
  // UPDATE PROFILE
  // ==========================
  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      await axios.put(
        `${API_URL}/api/doctor/${doctorId}`,
        {
          ...form,
          Study: form.Study ? JSON.parse(form.Study) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Berhasil", "Profil dokter diperbarui");
    } catch (err) {
      Alert.alert("Gagal", err.response?.data?.message || "Update gagal");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-blue-50">
      {/* HEADER SECTION */}
      <View className="bg-blue-600 pt-8 pb-6 px-5 rounded-b-3xl">
        <View className="flex-row items-center mb-2">
          <View className="bg-blue-500 p-3 rounded-2xl mr-3">
            <User size={28} color="#ffffff" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Profil Dokter</Text>
            <Text className="text-blue-100 text-sm mt-1">
              Kelola informasi profesional Anda
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View className="flex-row items-center mt-4">
          <View
            className={`px-3 py-1.5 rounded-full flex-row items-center ${
              form.isActive ? "bg-green-500" : "bg-gray-500"
            }`}
          >
            <View className="w-2 h-2 bg-white rounded-full mr-2" />
            <Text className="text-white text-xs font-semibold">
              {form.isActive ? "Aktif" : "Tidak Aktif"}
            </Text>
          </View>
        </View>
      </View>

      {/* PROFILE CARD */}
      <View className="px-5 mt-5">
        <View className="bg-white rounded-3xl p-6 border border-blue-100">
          {/* Profile Summary */}
          <View className="flex-row items-center mb-6 pb-6 border-b border-blue-100">
            <View className="bg-blue-100 w-16 h-16 rounded-2xl items-center justify-center mr-4">
              <Text className="text-blue-600 text-2xl font-bold">
                {form.name ? form.name.charAt(0).toUpperCase() : "D"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 text-lg font-bold">
                {form.name || "Nama Dokter"}
              </Text>
              <Text className="text-blue-600 text-sm font-medium mt-1">
                {form.specialization || "Spesialisasi"}
              </Text>
            </View>
          </View>

          {/* Quick Info */}
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-50 p-2 rounded-lg mr-3">
              <Phone size={16} color="#2563eb" strokeWidth={2} />
            </View>
            <Text className="text-gray-600 text-sm flex-1">
              {form.phone || "Belum ada nomor telepon"}
            </Text>
          </View>

          {form.bio && (
            <View className="bg-blue-50 rounded-xl p-4 mt-2">
              <Text className="text-gray-700 text-sm leading-5">
                {form.bio}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* FORM SECTION */}
      <View className="px-5 mt-6">
        <Text className="text-blue-900 font-bold text-lg mb-4">
          Informasi Pribadi
        </Text>

        {/* NAME */}
        <Input
          icon={User}
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        {/* PHONE */}
        <Input
          icon={Phone}
          label="Nomor Telepon"
          placeholder="Contoh: 08123456789"
          value={form.phone}
          keyboard="phone-pad"
          onChange={(v) => setForm({ ...form, phone: v })}
        />

        {/* SPECIALIZATION */}
        <Input
          icon={Stethoscope}
          label="Spesialisasi"
          placeholder="Contoh: Dokter Umum, Spesialis Anak"
          value={form.specialization}
          onChange={(v) => setForm({ ...form, specialization: v })}
        />

        <Text className="text-blue-900 font-bold text-lg mb-4 mt-6">
          Informasi Profesional
        </Text>

        {/* BIO */}
        <Input
          icon={FileText}
          label="Bio Dokter"
          placeholder="Ceritakan tentang diri Anda, pengalaman, dan keahlian..."
          value={form.bio}
          multiline
          onChange={(v) => setForm({ ...form, bio: v })}
        />

        {/* STUDY */}
        <Input
          icon={GraduationCap}
          label="Riwayat Pendidikan"
          placeholder='{"university": "Nama Universitas", "year": "2020"}'
          value={form.Study}
          multiline
          onChange={(v) => setForm({ ...form, Study: v })}
        />

        {/* ACTION BUTTONS */}
        <View className="mt-6 mb-4">
          {/* SAVE BUTTON */}
          <TouchableOpacity
            onPress={handleUpdate}
            className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center mb-3"
          >
            <Save size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-white font-bold text-base ml-2">
              Simpan Perubahan
            </Text>
          </TouchableOpacity>

          {/* RESET PASSWORD BUTTON */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Reset-Password")}
            className="bg-white border-2 border-blue-600 py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Lock size={20} color="#2563eb" strokeWidth={2} />
            <Text className="text-blue-600 font-bold text-base ml-2">
              Ubah Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* INFO BOX */}
        <View className="bg-blue-100 rounded-2xl p-4 mb-8 mt-2">
          <View className="flex-row items-start">
            <View className="bg-blue-200 p-2 rounded-lg mr-3">
              <FileText size={16} color="#2563eb" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-blue-900 font-semibold text-sm mb-1">
                Tips Profil
              </Text>
              <Text className="text-blue-700 text-xs leading-5">
                Lengkapi profil Anda dengan informasi yang akurat dan detail
                untuk meningkatkan kepercayaan pasien.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ==========================
// REUSABLE INPUT COMPONENT
// ==========================
function Input({
  icon: Icon,
  label,
  value,
  onChange,
  multiline = false,
  keyboard,
  placeholder,
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        {Icon && (
          <View className="bg-blue-100 p-1.5 rounded-lg mr-2">
            <Icon size={16} color="#2563eb" strokeWidth={2} />
          </View>
        )}
        <Text className="text-gray-800 font-semibold text-sm">{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        multiline={multiline}
        placeholder={placeholder}
        className={`bg-white border border-blue-200 rounded-xl px-4 py-3.5 text-gray-800 ${
          multiline ? "h-28" : ""
        }`}
        placeholderTextColor="#94a3b8"
        style={{
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}