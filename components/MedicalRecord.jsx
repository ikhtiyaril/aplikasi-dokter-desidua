import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  StatusBar,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
// Import Icons
import { 
  Search, 
  X, 
  ClipboardList, 
  User, 
  Calendar, 
  MessageSquare, 
  Activity, 
  Target, 
  FileText, 
  Edit3, 
  Save,
  CheckCircle2,
  Circle,
  ChevronRight
} from "lucide-react-native";

export default function MedicalRecord({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  /* ================= FETCH (Logic Tetap) ================= */
  const fetchRecords = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get(`${API_URL}/api/medical-record`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data || []);
      setFilteredRecords(res.data || []);
    } catch (err) {
      alert("Gagal memuat data rekam medis");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH (Logic Tetap) ================= */
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

  /* ================= SAVE (Logic Tetap) ================= */
  const handleSave = async () => {
    if (!selectedRecord) return;
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("authToken");
      await axios.patch(`${API_URL}/api/medical-record/${selectedRecord.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Rekam medis berhasil diperbarui ✅");
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      alert("Gagal memperbarui rekam medis");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-400 font-medium mt-4">Memuat rekam medis...</Text>
      </View>
    );
  }

  const soapFields = [
    { key: "subjective", label: "Subjective (S)", icon: <MessageSquare size={20} color="#2563eb" />, placeholder: "Keluhan pasien, riwayat penyakit, gejala..." },
    { key: "objective", label: "Objective (O)", icon: <Activity size={20} color="#2563eb" />, placeholder: "Hasil pemeriksaan fisik, vital signs, lab..." },
    { key: "assessment", label: "Assessment (A)", icon: <Target size={20} color="#2563eb" />, placeholder: "Diagnosis, analisis kondisi..." },
    { key: "plan", label: "Plan (P)", icon: <FileText size={20} color="#2563eb" />, placeholder: "Rencana perawatan, resep, tindakan..." },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-14 pb-10 rounded-b-[40px] shadow-lg">
        <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">Database Pasien</Text>
        <Text className="text-white text-3xl font-extrabold mt-1">Rekam Medis</Text>
      </View>

      {/* SEARCH BAR */}
      <View className="px-6 -mt-8 mb-6">
        <View className="bg-white rounded-2xl shadow-xl shadow-blue-100 flex-row items-center px-4 py-1 border border-slate-100">
          <Search size={20} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Cari nama pasien..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-slate-900 text-base h-14 ml-3 font-medium"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")} className="bg-slate-100 p-1 rounded-full">
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* STATS CARD */}
      <View className="px-6 mb-6">
        <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase">Total Rekaman</Text>
            <Text className="text-slate-900 text-3xl font-black mt-1">{records.length}</Text>
          </View>
          <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center">
            <ClipboardList size={28} color="#2563eb" />
          </View>
        </View>
      </View>

      {/* RECORDS LIST */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredRecords.length === 0 ? (
          <View className="bg-white rounded-3xl p-10 items-center border border-dashed border-slate-300 mt-4">
            <View className="bg-slate-50 p-6 rounded-full mb-4">
              <ClipboardList size={48} color="#cbd5e1" />
            </View>
            <Text className="text-slate-900 font-bold text-lg">
              {searchQuery ? "Tidak Ditemukan" : "Belum Ada Data"}
            </Text>
            <Text className="text-slate-400 text-center mt-2 leading-5">
              {searchQuery ? `Hasil pencarian untuk "${searchQuery}" nihil.` : "Data rekam medis pasien akan tampil di sini."}
            </Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <View key={record.id} className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-slate-100">
              {/* PATIENT INFO */}
              <View className="flex-row items-start justify-between mb-5">
                <View className="flex-row items-center flex-1">
                  <View className="w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center mr-4 shadow-md shadow-blue-200">
                    <User size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Pressable 
                      onPress={() => navigation.navigate("PatientHistory", { patientId: record.patient_id })}
                      className="flex-row items-center"
                    >
                      <Text className="text-slate-900 font-bold text-lg mr-1">
                        {record.patient?.name || "Unknown"}
                      </Text>
                      <ChevronRight size={16} color="#cbd5e1" />
                    </Pressable>
                    <View className="flex-row items-center mt-1">
                      <Calendar size={12} color="#64748b" />
                      <Text className="text-slate-500 text-xs ml-1 font-medium">
                        {new Date(record.consultation_date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* SOAP STATUS TAGS */}
              <View className="bg-slate-50 rounded-2xl p-4 mb-5">
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 ml-1">Kelengkapan SOAP</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { key: 'subjective', label: 'S', icon: <MessageSquare size={12} /> },
                    { key: 'objective', label: 'O', icon: <Activity size={12} /> },
                    { key: 'assessment', label: 'A', icon: <Target size={12} /> },
                    { key: 'plan', label: 'P', icon: <FileText size={12} /> },
                  ].map((item) => (
                    <View 
                      key={item.key}
                      className={`px-3 py-2 rounded-xl flex-row items-center border ${
                        record[item.key] ? 'bg-green-50 border-green-100' : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text className={record[item.key] ? 'text-green-600' : 'text-slate-300'}>
                         {record[item.key] ? <CheckCircle2 size={12} color="#16a34a" /> : <Circle size={12} color="#cbd5e1" />}
                      </Text>
                      <Text className={`text-xs font-bold ml-1.5 ${record[item.key] ? 'text-green-700' : 'text-slate-400'}`}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleEdit(record)}
                className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-200"
                activeOpacity={0.8}
              >
                <Edit3 size={18} color="white" />
                <Text className="text-white font-bold ml-2">Edit SOAP</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] h-[85%] shadow-2xl">
            {/* Handle Bar */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mt-4 mb-2" />
            
            {/* MODAL HEADER */}
            <View className="px-8 py-6 border-b border-slate-100 flex-row justify-between items-center">
              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase">Update Rekam Medis</Text>
                <Text className="text-slate-900 text-2xl font-black mt-1">
                  {selectedRecord?.patient?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} className="bg-slate-100 p-2 rounded-full">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* MODAL CONTENT */}
            <ScrollView className="flex-1 px-8 py-4" showsVerticalScrollIndicator={false}>
              {soapFields.map((item, index) => (
                <View key={item.key} className="mb-6">
                  <View className="flex-row items-center justify-between mb-3 ml-1">
                    <View className="flex-row items-center">
                      <View className="bg-blue-50 p-2 rounded-lg mr-3">{item.icon}</View>
                      <Text className="text-slate-900 font-bold text-base">{item.label}</Text>
                    </View>
                    <Text className="text-slate-300 text-xs font-bold">Langkah {index + 1}/4</Text>
                  </View>

                  <View className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden focus:border-blue-500">
                    <TextInput
                      value={form[item.key]}
                      onChangeText={(text) => setForm({ ...form, [item.key]: text })}
                      multiline
                      textAlignVertical="top"
                      className="p-5 min-h-[120px] text-slate-900 font-medium"
                      placeholder={item.placeholder}
                      placeholderTextColor="#94a3b8"
                    />
                    <View className="bg-white/50 px-4 py-2 border-t border-slate-100 flex-row justify-end">
                      <Text className="text-slate-400 text-[10px] font-bold italic">
                        {form[item.key]?.length || 0} Karakter
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className={`py-5 rounded-2xl mb-12 flex-row items-center justify-center shadow-xl ${
                  saving ? "bg-slate-300" : "bg-blue-600 shadow-blue-200"
                }`}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={20} color="white" />
                    <Text className="text-white font-bold ml-2 text-lg">Simpan Perubahan</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}