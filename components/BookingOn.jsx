import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, StatusBar } from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
// Import Lucide Icons
import { 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Check, 
  CreditCard, 
  AlertCircle, 
  User, 
  Stethoscope, 
  ClipboardCheck,
  Calendar,
  Hash,
  RotateCcw,
  Info
} from "lucide-react-native";

export default function BookingVideoCall() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Status Config dengan Ikon Lucide
  const statusConfig = {
    pending: { 
      bg: "bg-amber-50", 
      text: "text-amber-700", 
      border: "border-amber-200",
      label: "Menunggu",
      icon: <Clock size={14} color="#b45309" />
    },
    confirmed: { 
      bg: "bg-emerald-50", 
      text: "text-emerald-700", 
      border: "border-emerald-200",
      label: "Terkonfirmasi",
      icon: <CheckCircle2 size={14} color="#047857" />
    },
    cancelled: { 
      bg: "bg-rose-50", 
      text: "text-rose-700", 
      border: "border-rose-200",
      label: "Dibatalkan",
      icon: <XCircle size={14} color="#be123c" />
    },
    completed: { 
      bg: "bg-blue-50", 
      text: "text-blue-700", 
      border: "border-blue-200",
      label: "Selesai",
      icon: <ClipboardCheck size={14} color="#1d4ed8" />
    },
  };

  const paymentConfig = {
    paid: { 
      bg: "bg-green-50", 
      text: "text-green-700", 
      border: "border-green-200",
      label: "Lunas",
      icon: <CreditCard size={14} color="#15803d" />
    },
    unpaid: { 
      bg: "bg-orange-50", 
      text: "text-orange-700", 
      border: "border-orange-200",
      label: "Belum Bayar",
      icon: <AlertCircle size={14} color="#c2410c" />
    },
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/api/booking/doctor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responses = res.data.data;
      const dataFilter = responses.filter(s => s.Service.is_live);
      setData(dataFilter);
    } catch (err) {
      console.error(err);
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
      Alert.alert("Error", "Gagal mengubah status");
    }
  };

  const handleCall = async (booking_id) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/api/call/${booking_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });

      if (res.data.token) {
        navigation.navigate('Video-Call', { tokenRoom: res.data.token });
      } else {
        Alert.alert("Error", "Sesi panggilan tidak tersedia");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Gagal memulai panggilan");
    }
  };

  const renderActions = (item) => {
    const isPaid = item.payment_status === "paid";

    switch (item.status) {
      case "pending":
        return (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => isPaid ? updateStatus(item.id, "confirmed") : Alert.alert("Pembayaran Belum Lunas", "Konfirmasi hanya setelah pembayaran lunas.")}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl ${isPaid ? "bg-blue-600 shadow-sm" : "bg-slate-200"}`}
            >
              <Check size={18} color={isPaid ? "white" : "#94a3b8"} />
              <Text className={`font-bold ml-2 ${isPaid ? "text-white" : "text-slate-400"}`}>Konfirmasi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateStatus(item.id, "cancelled")}
              className="flex-1 flex-row items-center justify-center bg-rose-50 border border-rose-100 py-3.5 rounded-2xl"
            >
              <XCircle size={18} color="#e11d48" />
              <Text className="text-rose-600 font-bold ml-2">Batalkan</Text>
            </TouchableOpacity>
          </View>
        );

      case "confirmed":
        return (
          <TouchableOpacity
            onPress={() => isPaid ? updateStatus(item.id, "completed") : Alert.alert("Selesaikan?", "Selesaikan sesi layanan?")}
            className={`flex-row items-center justify-center py-3.5 rounded-2xl bg-white border border-blue-600`}
          >
            <ClipboardCheck size={18} color="#2563eb" />
            <Text className="text-blue-600 font-bold ml-2">Selesaikan Sesi</Text>
          </TouchableOpacity>
        );

      case "cancelled":
        return (
          <TouchableOpacity
            onPress={() => updateStatus(item.id, "pending")}
            className="flex-row items-center justify-center bg-amber-50 border border-amber-200 py-3.5 rounded-2xl"
          >
            <RotateCcw size={18} color="#d97706" />
            <Text className="text-amber-700 font-bold ml-2">Aktifkan Kembali</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-14 pb-10 rounded-b-[40px] shadow-lg">
        <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">Sesi Konsultasi</Text>
        <Text className="text-white text-3xl font-extrabold mt-1">Video Call</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
      >
        <View className="py-6">
          {/* STATS SUMMARY */}
          <View className="flex-row mb-6 gap-4">
            <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <View className="bg-blue-50 w-8 h-8 rounded-lg items-center justify-center mb-3">
                <Hash size={16} color="#2563eb" />
              </View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Total</Text>
              <Text className="text-slate-900 text-2xl font-black">{data.length}</Text>
            </View>
            <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <View className="bg-amber-50 w-8 h-8 rounded-lg items-center justify-center mb-3">
                <Clock size={16} color="#d97706" />
              </View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Pending</Text>
              <Text className="text-amber-600 text-2xl font-black">
                {data.filter(d => d.status === 'pending').length}
              </Text>
            </View>
          </View>

          {loading && !refreshing && (
            <View className="items-center py-10">
              <ActivityIndicator color="#2563eb" />
            </View>
          )}

          {/* BOOKING CARDS */}
          {data.map((item) => {
            const statusInfo = statusConfig[item.status];
            const paymentInfo = paymentConfig[item.payment_status];

            return (
              <View key={item.id} className="bg-white rounded-[32px] p-6 mb-5 shadow-sm border border-slate-100">
                {/* CARD HEADER */}
                <View className="flex-row justify-between items-start mb-5">
                  <View>
                    <View className="bg-slate-100 px-3 py-1 rounded-full self-start mb-2">
                      <Text className="text-slate-600 text-[10px] font-bold">{item.booking_code}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#64748b" />
                      <Text className="text-slate-500 text-xs ml-1.5 font-medium">{item.date} • {item.time_start}</Text>
                    </View>
                  </View>
                  <View className="items-end gap-2">
                    <View className={`${statusInfo.bg} ${statusInfo.border} border px-3 py-1 rounded-xl flex-row items-center`}>
                      {statusInfo.icon}
                      <Text className={`${statusInfo.text} text-[10px] font-bold ml-1.5`}>{statusInfo.label}</Text>
                    </View>
                    <View className={`${paymentInfo.bg} ${paymentInfo.border} border px-3 py-1 rounded-xl flex-row items-center`}>
                      {paymentInfo.icon}
                      <Text className={`${paymentInfo.text} text-[10px] font-bold ml-1.5`}>{paymentInfo.label}</Text>
                    </View>
                  </View>
                </View>

                {/* PATIENT INFO */}
                <View className="bg-slate-50 rounded-2xl p-4 mb-5">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm">
                      <User size={20} color="#2563eb" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Pasien</Text>
                      <Text className="text-slate-900 font-bold text-base">{item.patient?.name}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Stethoscope size={14} color="#64748b" />
                    <Text className="text-slate-600 text-xs ml-2 font-medium" numberOfLines={1}>{item.Service?.name}</Text>
                  </View>
                </View>

                {/* VIDEO CALL ACTION */}
                {item.status === 'confirmed' && (
                  <TouchableOpacity
                    onPress={() => handleCall(item.id)}
                    className="bg-blue-600 flex-row items-center justify-center py-4 rounded-2xl mb-3 shadow-lg shadow-blue-200"
                    activeOpacity={0.9}
                  >
                    <Video size={20} color="white" />
                    <Text className="text-white font-extrabold ml-3 text-base">Mulai Video Call Sekarang</Text>
                  </TouchableOpacity>
                )}

                {/* OTHER ACTIONS */}
                {renderActions(item)}
              </View>
            );
          })}

          {/* EMPTY STATE */}
          {data.length === 0 && !loading && (
            <View className="bg-white rounded-[40px] p-12 items-center border border-dashed border-slate-200 mt-4">
              <View className="bg-blue-50 p-6 rounded-full mb-6">
                <Video size={48} color="#3b82f6" />
              </View>
              <Text className="text-slate-900 font-black text-xl text-center">Tidak Ada Panggilan</Text>
              <Text className="text-slate-400 text-center mt-2 font-medium">Jadwal konsultasi video call Anda akan muncul di sini.</Text>
            </View>
          )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}