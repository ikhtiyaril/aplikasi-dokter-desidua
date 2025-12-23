import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function BookingOn() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const statusConfig = {
    pending: { 
      bg: "bg-yellow-50", 
      text: "text-yellow-700", 
      border: "border-yellow-200",
      label: "Menunggu",
      emoji: "⏳"
    },
    confirmed: { 
      bg: "bg-green-50", 
      text: "text-green-700", 
      border: "border-green-200",
      label: "Terkonfirmasi",
      emoji: "✅"
    },
    cancelled: { 
      bg: "bg-red-50", 
      text: "text-red-700", 
      border: "border-red-200",
      label: "Dibatalkan",
      emoji: "❌"
    },
    completed: { 
      bg: "bg-blue-50", 
      text: "text-blue-700", 
      border: "border-blue-200",
      label: "Selesai",
      emoji: "✔️"
    },
  };

  const paymentConfig = {
    paid: { 
      bg: "bg-green-50", 
      text: "text-green-700", 
      border: "border-green-200",
      label: "Lunas",
      emoji: "💰"
    },
    unpaid: { 
      bg: "bg-orange-50", 
      text: "text-orange-700", 
      border: "border-orange-200",
      label: "Belum Bayar",
      emoji: "⏱️"
    },
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      console.log(token);
      const res = await axios.get(`${API_URL}/api/booking/doctor`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(res.data.data);
      const responses = res.data.data;
      const dataFilter = responses.filter(s => (s.Service.is_live));
      setData(dataFilter);
    } catch (err) {
      console.error("Gagal fetch booking:", err);
      Alert.alert("Error", "Gagal memuat data booking");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/booking/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Gagal update status:", err);
      Alert.alert("Error", "Gagal mengubah status booking");
    }
  };

  const renderActions = (item) => {
    switch (item.status) {
      case "pending":
        return (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => updateStatus(item.id, "confirmed")}
              className="flex-1 bg-blue-600 px-4 py-3 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-semibold text-center">✓ Konfirmasi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateStatus(item.id, "cancelled")}
              className="flex-1 bg-red-600 px-4 py-3 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-semibold text-center">✕ Batalkan</Text>
            </TouchableOpacity>
          </View>
        );
      case "confirmed":
        return (
          <TouchableOpacity
            onPress={() => updateStatus(item.id, "completed")}
            className="bg-blue-600 px-4 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-semibold text-center">✔ Selesaikan</Text>
          </TouchableOpacity>
        );
      case "cancelled":
        return (
          <TouchableOpacity
            onPress={() => updateStatus(item.id, "pending")}
            className="bg-yellow-600 px-4 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-semibold text-center">↻ Aktifkan Kembali</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const handleCall = async (booking_id) => {
    const token = await AsyncStorage.getItem('authToken');
    const res = await axios.get(`${API_URL}/api/call/${booking_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const tokenRoom = res.data.token;
    navigation.navigate('Video-Call', { tokenRoom });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-12 pb-6">
        <Text className="text-white text-sm font-medium opacity-90">Daftar Booking</Text>
        <Text className="text-white text-3xl font-bold mt-1">Video Call</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          {/* STATS SUMMARY */}
          <View className="flex-row mb-4 gap-3">
            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-500 text-xs font-medium">Total Booking</Text>
              <Text className="text-gray-900 text-2xl font-bold mt-1">{data.length}</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-500 text-xs font-medium">Pending</Text>
              <Text className="text-yellow-600 text-2xl font-bold mt-1">
                {data.filter(d => d.status === 'pending').length}
              </Text>
            </View>
          </View>

          {loading && !refreshing && (
            <View className="bg-white rounded-xl p-8 items-center shadow-sm">
              <Text className="text-gray-500">Loading...</Text>
            </View>
          )}

          {/* BOOKING CARDS */}
          {data.map((item) => {
            const statusInfo = statusConfig[item.status];
            const paymentInfo = paymentConfig[item.payment_status];

            return (
              <View
                key={item.id}
                className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
              >
                {/* HEADER CARD */}
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-gray-900 text-lg font-bold">{item.booking_code}</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {item.date} • {item.time_start}
                    </Text>
                  </View>
                  <View className="items-end gap-2">
                    <View className={`${statusInfo.bg} ${statusInfo.border} border px-3 py-1.5 rounded-lg flex-row items-center`}>
                      <Text className="text-xs mr-1">{statusInfo.emoji}</Text>
                      <Text className={`${statusInfo.text} text-xs font-semibold`}>
                        {statusInfo.label}
                      </Text>
                    </View>
                    <View className={`${paymentInfo.bg} ${paymentInfo.border} border px-3 py-1.5 rounded-lg flex-row items-center`}>
                      <Text className="text-xs mr-1">{paymentInfo.emoji}</Text>
                      <Text className={`${paymentInfo.text} text-xs font-semibold`}>
                        {paymentInfo.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* PATIENT & SERVICE INFO */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <View className="mb-3">
                    <Text className="text-gray-500 text-xs mb-1">Pasien</Text>
                    <Text className="text-gray-900 font-semibold">{item.patient?.name}</Text>
                  </View>
                  <View className="mb-3">
                    <Text className="text-gray-500 text-xs mb-1">Layanan</Text>
                    <Text className="text-gray-900 font-semibold">{item.Service?.name}</Text>
                  </View>
                  <View>
                    <Text className="text-gray-500 text-xs mb-1">Dokter</Text>
                    <Text className="text-gray-900 font-semibold">{item.Doctor?.name || "-"}</Text>
                  </View>
                </View>

                {/* VIDEO CALL BUTTON */}
                {item.status === 'confirmed' && (
                  <TouchableOpacity
                    className="bg-blue-600 px-4 py-3 rounded-xl mb-3 flex-row items-center justify-center"
                    onPress={() => handleCall(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text className="text-2xl mr-2">📹</Text>
                    <Text className="text-white text-sm font-bold">Mulai Video Call</Text>
                  </TouchableOpacity>
                )}

                {/* ACTION BUTTONS */}
                {renderActions(item)}
              </View>
            );
          })}

          {data.length === 0 && !loading && (
            <View className="bg-white rounded-xl p-8 items-center shadow-sm">
              <Text className="text-6xl mb-3">📋</Text>
              <Text className="text-gray-900 font-bold text-lg">Belum Ada Booking</Text>
              <Text className="text-gray-500 text-center mt-2">
                Booking video call akan muncul di sini
              </Text>
            </View>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}