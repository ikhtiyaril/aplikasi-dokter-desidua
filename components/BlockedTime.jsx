import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import FloatingFormBlockedTime from "./FloatingFormBlockedTime";
// Import Icons
import { 
  Lock, 
  Calendar as CalendarIcon, 
  Trash2, 
  Plus, 
  Clock, 
  ArrowRight,
  CalendarOff,
  ChevronRight
} from "lucide-react-native";

export default function BlockedTime() {
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH (Logic Tetap) ================= */
  const fetchBlockedTimes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get(`${API_URL}/api/blocked-time/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlockedTimes(res.data);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat waktu yang diblokir");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlockedTimes();
  };

  useEffect(() => {
    fetchBlockedTimes();
  }, []);

  /* ================= ADD (Logic Tetap) ================= */
  const handleAddBlock = async (data) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/blocked-time/doctor`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowForm(false);
      fetchBlockedTimes();
    } catch {
      Alert.alert("Error", "Gagal menambahkan waktu blokir");
    }
  };

  /* ================= DELETE (Logic Tetap) ================= */
  const handleDelete = (id) => {
    Alert.alert("Konfirmasi", "Hapus waktu blokir ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");
            await axios.delete(`${API_URL}/api/blocked-time/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setBlockedTimes((prev) => prev.filter((b) => b.id !== id));
          } catch {
            Alert.alert("Error", "Gagal menghapus");
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-14 pb-10 rounded-b-[40px] shadow-lg">
        <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">Manajemen Jadwal</Text>
        <Text className="text-white text-3xl font-extrabold mt-1">Blokir Waktu</Text>
      </View>

      {/* STATS CARD */}
      <View className="mx-6 -mt-8 bg-white rounded-[24px] shadow-xl shadow-blue-200 p-5 mb-6 border border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase">Total Terblokir</Text>
            <View className="flex-row items-end mt-1">
              <Text className="text-slate-900 text-3xl font-black">{blockedTimes.length}</Text>
              <Text className="text-slate-400 ml-2 mb-1 font-medium">Sesi</Text>
            </View>
          </View>
          <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center">
            <Lock size={28} color="#2563eb" />
          </View>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={blockedTimes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="bg-white rounded-3xl p-10 items-center border border-dashed border-slate-300 mt-4">
            <View className="bg-slate-50 p-6 rounded-full mb-4">
               <CalendarOff size={48} color="#cbd5e1" />
            </View>
            <Text className="text-slate-900 font-bold text-lg">Belum Ada Blokir</Text>
            <Text className="text-slate-400 text-center mt-2 leading-5">
              Semua waktu Anda saat ini tersedia untuk dipesan oleh pasien.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-slate-100">
            {/* DATE HEADER */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3 shadow-md shadow-blue-200">
                  <CalendarIcon size={18} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Tanggal Blokir</Text>
                  <Text className="text-slate-900 font-bold text-[15px]">
                    {formatDate(item.date)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-red-50 rounded-lg">
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* TIME INFO */}
            <View className="flex-row items-center bg-slate-50 rounded-[18px] p-4">
              <View className="flex-1 items-center">
                <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Mulai</Text>
                <Text className="text-slate-900 font-black text-lg">{item.time_start}</Text>
              </View>
              
              <View className="px-4">
                <ArrowRight size={16} color="#cbd5e1" />
              </View>

              <View className="flex-1 items-center">
                <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Selesai</Text>
                <Text className="text-slate-900 font-black text-lg">{item.time_end}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity
        onPress={() => setShowForm(true)}
        className="absolute bottom-10 right-6 bg-blue-600 w-16 h-16 rounded-full justify-center items-center shadow-2xl shadow-blue-500"
        activeOpacity={0.9}
      >
        <Plus size={32} color="white" strokeWidth={3} />
      </TouchableOpacity>

      {showForm && (
        <FloatingFormBlockedTime
          onClose={() => setShowForm(false)}
          onSubmit={handleAddBlock}
        />
      )}
    </View>
  );
}