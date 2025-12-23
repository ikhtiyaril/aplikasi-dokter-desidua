import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [time, setTime] = useState({
    start_time: "",
    end_time: "",
  });

  // state untuk memanggil DateTimePicker
  const [picker, setPicker] = useState({
    visible: false,
    field: null, // 'start' atau 'end'
    value: new Date(),
  });

  const days = [
    { name: "Minggu", short: "Min", index: 0, emoji: "☀️" },
    { name: "Senin", short: "Sen", index: 1, emoji: "📘" },
    { name: "Selasa", short: "Sel", index: 2, emoji: "📗" },
    { name: "Rabu", short: "Rab", index: 3, emoji: "📙" },
    { name: "Kamis", short: "Kam", index: 4, emoji: "📕" },
    { name: "Jumat", short: "Jum", index: 5, emoji: "📔" },
    { name: "Sabtu", short: "Sab", index: 6, emoji: "📓" },
  ];

  // =============================
  // HELPERS: konversi waktu
  // =============================
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

  const dateToTimeString = (date) => {
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    return `${h}:${m}`;
  };

  const timeStringToDate = (hhmm) => {
    const [hh, mm] = (hhmm || "08:00").split(":").map((x) => parseInt(x, 10));
    const d = new Date();
    d.setHours(Number.isFinite(hh) ? hh : 8);
    d.setMinutes(Number.isFinite(mm) ? mm : 0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  };

  // =============================
  // FETCH SCHEDULES
  // =============================
  const fetchSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Auth Error", "Token tidak ditemukan");
        return;
      }

      const res = await axios.get(`${API_URL}/api/doctor-schedule/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Sort by day of week (0-6)
      const sortedSchedules = res.data.sort(
        (a, b) => a.day_of_week - b.day_of_week
      );
      setSchedules(sortedSchedules);
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Gagal memuat jadwal");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // =============================
  // EDIT SINGLE SCHEDULE
  // =============================
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setTime({
      start_time: schedule.start_time,
      end_time: schedule.end_time,
    });
    setShowEditModal(true);
  };

  // buka picker; kita set initial value sesuai time yang ada (atau default)
  const openTimePicker = (field) => {
    const current = field === "start" ? time.start_time : time.end_time;
    setPicker({
      visible: true,
      field,
      value: timeStringToDate(current),
    });
  };

  // handler perubahan waktu dari DateTimePicker
  const onPickerChange = (event, selectedDate) => {
    // Untuk Android, event.type === 'dismissed' ketika user cancel
    if (Platform.OS === "android") {
      setPicker((p) => ({ ...p, visible: false }));
      if (!selectedDate) return; // user dismissed
    }
    // For iOS selectedDate may be undefined when closing; guard it
    const d = selectedDate || picker.value;
    const hhmm = dateToTimeString(d);
    if (picker.field === "start") {
      setTime((t) => ({ ...t, start_time: hhmm }));
    } else if (picker.field === "end") {
      setTime((t) => ({ ...t, end_time: hhmm }));
    }

    // For iOS we keep picker visible only if needed; but default close behaviour below:
    if (Platform.OS === "android") {
      setPicker((p) => ({ ...p, visible: false, field: null }));
    } else {
      // iOS: keep visible false to mimic modal closing after selection
      setPicker((p) => ({ ...p, visible: false, field: null }));
    }
  };

 const handleUpdateSchedule = async () => {
  if (!time.start_time || !time.end_time) {
    Alert.alert("Error", "Isi waktu dengan lengkap");
    return;
  }

  if (!editingSchedule) {
    Alert.alert("Error", "Tidak ada jadwal yang diedit");
    return;
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time.start_time) || !timeRegex.test(time.end_time)) {
    Alert.alert("Error", "Format waktu harus HH:mm");
    return;
  }

  try {
    const token = await AsyncStorage.getItem("authToken");

    await axios.put(
      `${API_URL}/api/doctor-schedule/bulk-update`,
      {
        days: [editingSchedule.day_of_week], // 🔥 INI PENTING
        start_time: time.start_time,
        end_time: time.end_time,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setShowEditModal(false);
    setEditingSchedule(null);
    setTime({ start_time: "", end_time: "" });

    fetchSchedules();
    Alert.alert("Berhasil", "Jadwal berhasil diperbarui");
  } catch (err) {
    console.log(err.response?.data || err.message);
    Alert.alert("Error", "Gagal update jadwal");
  }
};


  // =============================
  // UI
  // =============================
  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-12 pb-6">
        <Text className="text-white text-sm font-medium opacity-90">Manajemen</Text>
        <Text className="text-white text-3xl font-bold mt-1">Jadwal Praktik</Text>
      </View>

      {/* STATS */}
      <View className="mx-6 -mt-4 bg-white rounded-2xl shadow-lg p-5 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-500 text-sm">Hari Praktik</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{schedules.length} Hari</Text>
          </View>
          <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center">
            <Text className="text-4xl">📅</Text>
          </View>
        </View>
      </View>

      {/* SCHEDULE LIST */}
      <ScrollView className="flex-1 px-6">
        {schedules.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
            <Text className="text-6xl mb-4">🗓️</Text>
            <Text className="text-gray-900 font-bold text-lg">Memuat Jadwal...</Text>
            <Text className="text-gray-500 text-center mt-2">
              Jadwal praktik Anda sedang dimuat
            </Text>
          </View>
        ) : (
          <View>
            {schedules.map((item) => {
              const dayInfo = days[item.day_of_week];
              return (
                <View key={item.id} className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                  {/* DAY HEADER */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                      <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                        <Text className="text-2xl">{dayInfo.emoji}</Text>
                      </View>
                      <View>
                        <Text className="text-gray-500 text-xs">Hari</Text>
                        <Text className="text-gray-900 font-bold text-xl">
                          {dayInfo.name}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleEditSchedule(item)}
                      className="bg-blue-600 px-4 py-2.5 rounded-xl"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-semibold">✏️ Edit</Text>
                    </TouchableOpacity>
                  </View>

                  {/* TIME INFO */}
                  <View className="bg-gray-50 rounded-xl p-4">
                    <Text className="text-gray-500 text-xs mb-3">Jam Praktik</Text>
                    <View className="flex-row items-center">
                      <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
                        <Text className="text-gray-500 text-xs mb-1">Mulai</Text>
                        <Text className="text-gray-900 font-bold text-2xl">{item.start_time}</Text>
                      </View>
                      <View className="mx-2">
                        <Text className="text-gray-400 text-2xl">→</Text>
                      </View>
                      <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
                        <Text className="text-gray-500 text-xs mb-1">Selesai</Text>
                        <Text className="text-gray-900 font-bold text-2xl">{item.end_time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">Edit Jadwal Praktik</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setTime({ start_time: "", end_time: "" });
                }}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-2xl text-gray-600">×</Text>
              </TouchableOpacity>
            </View>

            {editingSchedule && (
              <View className="mb-6 bg-blue-50 p-5 rounded-2xl flex-row items-center">
                <Text className="text-4xl mr-4">{days[editingSchedule.day_of_week].emoji}</Text>
                <View>
                  <Text className="text-blue-600 text-sm font-medium">Mengubah jadwal</Text>
                  <Text className="text-blue-900 font-bold text-2xl">
                    {days[editingSchedule.day_of_week].name}
                  </Text>
                </View>
              </View>
            )}

            {/* TIME INPUT */}
            <Text className="font-bold text-gray-900 mb-4 text-lg">Waktu Praktik</Text>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2 font-medium">Jam Mulai</Text>
              <View className="bg-gray-50 rounded-xl border-2 border-gray-200 px-4 flex-row items-center">
                <Text className="text-2xl mr-3">🕐</Text>

                {/* Touchable yang tampil mirip TextInput tapi membuka TimePicker */}
                <TouchableOpacity
                  onPress={() => openTimePicker("start")}
                  activeOpacity={0.8}
                  className="flex-1 p-4"
                >
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
                  >
                    {time.start_time || "08:00"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-400 text-xs mt-1 ml-1">Format: HH:mm (contoh: 08:00)</Text>
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 text-sm mb-2 font-medium">Jam Selesai</Text>
              <View className="bg-gray-50 rounded-xl border-2 border-gray-200 px-4 flex-row items-center">
                <Text className="text-2xl mr-3">🕐</Text>

                <TouchableOpacity
                  onPress={() => openTimePicker("end")}
                  activeOpacity={0.8}
                  className="flex-1 p-4"
                >
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
                  >
                    {time.end_time || "17:00"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-400 text-xs mt-1 ml-1">Format: HH:mm (contoh: 17:00)</Text>
            </View>

            {/* ACTION BUTTONS */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setTime({ start_time: "", end_time: "" });
                }}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 text-center font-bold text-base">
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateSchedule}
                className="flex-1 bg-blue-600 py-4 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-base">
                  💾 Simpan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Native DateTimePicker */}
      {picker.visible && (
        <DateTimePicker
          value={picker.value}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onPickerChange}
        />
      )}
    </View>
  );
}
