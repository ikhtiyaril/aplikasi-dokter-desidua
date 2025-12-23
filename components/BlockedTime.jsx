import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import FloatingFormBlockedTime from "./FloatingFormBlockedTime";

export default function BlockedTime() {
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH MY BLOCKED TIMES ================= */
  const fetchBlockedTimes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      const res = await axios.get(
        `${API_URL}/api/blocked-time/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  /* ================= ADD BLOCKED TIME ================= */
  const handleAddBlock = async (data) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      await axios.post(
        `${API_URL}/api/blocked-time/doctor`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowForm(false);
      fetchBlockedTimes();
    } catch {
      Alert.alert("Error", "Gagal menambahkan waktu blokir");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    Alert.alert("Konfirmasi", "Hapus waktu blokir ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");

            await axios.delete(
              `${API_URL}/api/blocked-time/${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            setBlockedTimes((prev) =>
              prev.filter((b) => b.id !== id)
            );
          } catch {
            Alert.alert("Error", "Gagal menghapus");
          }
        },
      },
    ]);
  };

  // Format date untuk display yang lebih baik
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-12 pb-6">
        <Text className="text-white text-sm font-medium opacity-90">Manajemen Waktu</Text>
        <Text className="text-white text-3xl font-bold mt-1">Block Waktu</Text>
      </View>

      {/* STATS CARD */}
      <View className="mx-6 -mt-4 bg-white rounded-2xl shadow-lg p-5 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-500 text-sm">Total Waktu Diblokir</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{blockedTimes.length}</Text>
          </View>
          <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center">
            <Text className="text-4xl">🔒</Text>
          </View>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={blockedTimes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm mt-4">
            <Text className="text-6xl mb-4">📅</Text>
            <Text className="text-gray-900 font-bold text-lg">Belum Ada Waktu Diblokir</Text>
            <Text className="text-gray-500 text-center mt-2">
              Tambahkan waktu yang tidak tersedia untuk booking
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            {/* DATE HEADER */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <Text className="text-2xl">📆</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Tanggal</Text>
                <Text className="text-gray-900 font-bold text-base">
                  {formatDate(item.date)}
                </Text>
              </View>
            </View>

            {/* TIME INFO */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-gray-500 text-xs mb-2">Jam Diblokir</Text>
              <View className="flex-row items-center">
                <View className="flex-1 bg-white rounded-lg p-3 mr-2">
                  <Text className="text-gray-500 text-xs mb-1">Mulai</Text>
                  <Text className="text-gray-900 font-bold text-lg">{item.time_start}</Text>
                </View>
                <Text className="text-gray-400 text-xl">→</Text>
                <View className="flex-1 bg-white rounded-lg p-3 ml-2">
                  <Text className="text-gray-500 text-xs mb-1">Selesai</Text>
                  <Text className="text-gray-900 font-bold text-lg">{item.time_end}</Text>
                </View>
              </View>
            </View>

            {/* DELETE BUTTON */}
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              className="bg-red-600 py-3 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold">
                🗑️ Hapus Blokir
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity
        onPress={() => setShowForm(true)}
        className="absolute bottom-8 right-6 bg-blue-600 w-16 h-16 rounded-2xl justify-center items-center shadow-xl"
        activeOpacity={0.9}
      >
        <Text className="text-white text-4xl font-light">+</Text>
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