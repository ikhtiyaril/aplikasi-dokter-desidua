import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function MedicalRecord({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  /**
   * FETCH ALL MEDICAL RECORDS
   */
  const fetchRecords = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const res = await axios.get(
        `${API_URL}/api/medical-record`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecords(res.data || []);
      setFilteredRecords(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data rekam medis");
    } finally {
      setLoading(false);
    }
  };

  /**
   * SEARCH FILTER
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record => 
      record.patient?.name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  /**
   * OPEN EDIT MODAL
   */
  const handleEdit = (record) => {
    setSelectedRecord(record);
    setForm({
      subjective: record.subjective || "",
      objective: record.objective || "",
      assessment: record.assessment || "",
      plan: record.plan || "",
    });
    setShowModal(true);
  };

  /**
   * SAVE SOAP
   */
  const handleSave = async () => {
    if (!selectedRecord) return;

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("authToken");

      await axios.patch(
        `${API_URL}/api/medical-record/${selectedRecord.id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Rekam medis berhasil diperbarui ✅");
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui rekam medis");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // LOADING
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Memuat rekam medis...</Text>
      </View>
    );
  }

  const soapFields = [
    { 
      key: "subjective", 
      label: "Subjective (S)", 
      emoji: "💬",
      placeholder: "Keluhan pasien, riwayat penyakit, gejala yang dirasakan..."
    },
    { 
      key: "objective", 
      label: "Objective (O)", 
      emoji: "🔬",
      placeholder: "Hasil pemeriksaan fisik, vital signs, hasil lab..."
    },
    { 
      key: "assessment", 
      label: "Assessment (A)", 
      emoji: "🎯",
      placeholder: "Diagnosis, analisis kondisi pasien..."
    },
    { 
      key: "plan", 
      label: "Plan (P)", 
      emoji: "📝",
      placeholder: "Rencana perawatan, resep obat, tindakan lanjutan..."
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-12 pb-6">
        <Text className="text-white text-sm font-medium opacity-90">Rekam Medis</Text>
        <Text className="text-white text-3xl font-bold mt-1">Daftar Pasien</Text>
      </View>

      {/* SEARCH BAR */}
      <View className="px-6 -mt-4 mb-4">
        <View className="bg-white rounded-xl shadow-lg flex-row items-center px-4 py-3 border-2 border-gray-200">
          <Text className="text-2xl mr-3">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Cari nama pasien..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-gray-900 text-base"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Text className="text-gray-400 text-xl">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* STATS */}
      <View className="px-6 mb-4">
        <View className="bg-white rounded-xl p-4 shadow-sm flex-row justify-between">
          <View>
            <Text className="text-gray-500 text-xs">Total Rekam Medis</Text>
            <Text className="text-gray-900 text-2xl font-bold">{records.length}</Text>
          </View>
          <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
            <Text className="text-2xl">📋</Text>
          </View>
        </View>
      </View>

      {/* RECORDS LIST */}
      <ScrollView className="flex-1 px-6">
        {filteredRecords.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "Tidak Ditemukan" : "Belum Ada Rekam Medis"}
            </Text>
            <Text className="text-gray-500 text-center">
              {searchQuery 
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Rekam medis pasien akan muncul di sini"
              }
            </Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <View key={record.id} className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              {/* PATIENT INFO */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                    <Text className="text-3xl">👤</Text>
                  </View>
                  <View className="flex-1">
                    <Pressable
                      onPress={() =>
                        navigation.navigate("PatientHistory", {
                          patientId: record.patient_id,
                        })
                      }
                    >
                      <Text className="text-blue-600 font-bold text-lg mb-1">
                        {record.patient?.name || "Unknown"}
                      </Text>
                    </Pressable>
                    <View className="flex-row items-center">
                      <Text className="text-base mr-2">📅</Text>
                      <Text className="text-gray-500 text-sm">
                        {new Date(record.consultation_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* SOAP PREVIEW */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-900 font-bold text-sm mb-3">Status SOAP</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { key: 'subjective', label: 'S', emoji: '💬' },
                    { key: 'objective', label: 'O', emoji: '🔬' },
                    { key: 'assessment', label: 'A', emoji: '🎯' },
                    { key: 'plan', label: 'P', emoji: '📝' },
                  ].map((item) => (
                    <View 
                      key={item.key}
                      className={`px-3 py-2 rounded-lg border ${
                        record[item.key] 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-100 border-gray-200'
                      }`}
                    >
                      <Text className={`text-xs font-semibold ${
                        record[item.key] ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {item.emoji} {item.label} {record[item.key] ? '✓' : '○'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* EDIT BUTTON */}
              <TouchableOpacity
                onPress={() => handleEdit(record)}
                className="bg-blue-600 py-3 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold">
                  ✏️ Edit SOAP
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white rounded-t-3xl mt-20">
            {/* MODAL HEADER */}
            <View className="bg-blue-600 px-6 py-6 rounded-t-3xl">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white text-sm font-medium opacity-90">Edit SOAP</Text>
                  <Text className="text-white text-2xl font-bold mt-1">
                    {selectedRecord?.patient?.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                >
                  <Text className="text-white text-2xl">✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* MODAL CONTENT */}
            <ScrollView className="flex-1 px-6 py-4">
              {soapFields.map((item, index) => (
                <View key={item.key} className="mb-4">
                  {/* Label */}
                  <View className="flex-row items-center mb-2">
                    <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                      <Text className="text-xl">{item.emoji}</Text>
                    </View>
                    <View>
                      <Text className="text-gray-900 font-bold text-base">{item.label}</Text>
                      <Text className="text-gray-500 text-xs">SOAP {index + 1}/4</Text>
                    </View>
                  </View>

                  {/* Input */}
                  <View className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <TextInput
                      value={form[item.key]}
                      onChangeText={(text) => setForm({ ...form, [item.key]: text })}
                      multiline
                      textAlignVertical="top"
                      className="p-4 min-h-[100px] text-gray-900"
                      placeholder={item.placeholder}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                      <Text className="text-gray-400 text-xs">
                        {form[item.key]?.length || 0} karakter
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* SAVE BUTTON */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className={`py-4 rounded-xl mb-6 ${
                  saving ? "bg-gray-400" : "bg-blue-600"
                } shadow-sm`}
                activeOpacity={0.8}
              >
                {saving ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-bold ml-2">Menyimpan...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    💾 Simpan Perubahan
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}