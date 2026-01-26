import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
// Import Icons
import { 
  Calendar, 
  Clock, 
  Edit3, 
  X, 
  Save, 
  ArrowRight, 
  ChevronRight,
  Clock4
} from "lucide-react-native";

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [time, setTime] = useState({
    start_time: "",
    end_time: "",
  });

  const [picker, setPicker] = useState({
    visible: false,
    field: null,
    value: new Date(),
  });

  // Data hari dengan skema warna yang lebih soft (elegan)
  const days = [
    { name: "Minggu", short: "Min", index: 0, color: "#ef4444" },
    { name: "Senin", short: "Sen", index: 1, color: "#3b82f6" },
    { name: "Selasa", short: "Sel", index: 2, color: "#10b981" },
    { name: "Rabu", short: "Rab", index: 3, color: "#f59e0b" },
    { name: "Kamis", short: "Kam", index: 4, color: "#8b5cf6" },
    { name: "Jumat", short: "Jum", index: 5, color: "#06b6d4" },
    { name: "Sabtu", short: "Sab", index: 6, color: "#6366f1" },
  ];

  // =============================
  // HELPERS (Logic Tetap)
  // =============================
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const dateToTimeString = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const timeStringToDate = (hhmm) => {
    const [hh, mm] = (hhmm || "08:00").split(":").map((x) => parseInt(x, 10));
    const d = new Date();
    d.setHours(Number.isFinite(hh) ? hh : 8);
    d.setMinutes(Number.isFinite(mm) ? mm : 0);
    d.setSeconds(0); d.setMilliseconds(0);
    return d;
  };

  // =============================
  // API CALLS (Logic Tetap)
  // =============================
  const fetchSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get(`${API_URL}/api/doctor-schedule/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedSchedules = res.data.sort((a, b) => a.day_of_week - b.day_of_week);
      setSchedules(sortedSchedules);
    } catch (err) {
      Alert.alert("Error", "Gagal memuat jadwal");
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setTime({ start_time: schedule.start_time, end_time: schedule.end_time });
    setShowEditModal(true);
  };

  const openTimePicker = (field) => {
    const current = field === "start" ? time.start_time : time.end_time;
    setPicker({ visible: true, field, value: timeStringToDate(current) });
  };

  const onPickerChange = (event, selectedDate) => {
    if (Platform.OS === "android") setPicker((p) => ({ ...p, visible: false }));
    const d = selectedDate || picker.value;
    const hhmm = dateToTimeString(d);
    if (picker.field === "start") setTime((t) => ({ ...t, start_time: hhmm }));
    else if (picker.field === "end") setTime((t) => ({ ...t, end_time: hhmm }));
    setPicker((p) => ({ ...p, visible: false, field: null }));
  };

  const handleUpdateSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.put(`${API_URL}/api/doctor-schedule/bulk-update`, 
        { days: [editingSchedule.day_of_week], start_time: time.start_time, end_time: time.end_time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      fetchSchedules();
      Alert.alert("Berhasil", "Jadwal berhasil diperbarui");
    } catch (err) {
      Alert.alert("Error", "Gagal update jadwal");
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-14 pb-10 rounded-b-[40px] shadow-lg">
        <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">Pengaturan</Text>
        <Text className="text-white text-3xl font-extrabold mt-1">Jadwal Praktik</Text>
      </View>

      {/* STATS CARD */}
      <View className="mx-6 -mt-8 bg-white rounded-[24px] shadow-xl shadow-blue-200 p-5 mb-6 border border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-tight">Hari Aktif</Text>
            <View className="flex-row items-end mt-1">
              <Text className="text-slate-900 text-3xl font-black">{schedules.length}</Text>
              <Text className="text-slate-400 ml-2 mb-1 font-medium">Hari Kerja</Text>
            </View>
          </View>
          <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center">
            <Calendar size={28} color="#2563eb" />
          </View>
        </View>
      </View>

      {/* SCHEDULE LIST */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {schedules.length === 0 ? (
          <View className="bg-white rounded-3xl p-10 items-center border border-dashed border-slate-300">
            <Clock4 size={48} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 font-medium">Memuat jadwal...</Text>
          </View>
        ) : (
          schedules.map((item) => {
            const dayInfo = days[item.day_of_week];
            return (
              <View key={item.id} className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-slate-100 overflow-hidden">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <View 
                      style={{ backgroundColor: dayInfo.color + '15' }}
                      className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    >
                      <Calendar size={20} color={dayInfo.color} />
                    </View>
                    <View>
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Hari Kerja</Text>
                      <Text className="text-slate-900 font-bold text-lg">{dayInfo.name}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleEditSchedule(item)}
                    className="bg-blue-50 px-4 py-2 rounded-xl flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <Edit3 size={14} color="#2563eb" />
                    <Text className="text-blue-600 font-bold ml-2 text-xs">Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* TIME RANGE BOX */}
                <View className="flex-row items-center bg-slate-50 rounded-[18px] p-4">
                  <View className="flex-1 items-center">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Mulai</Text>
                    <Text className="text-slate-900 font-black text-lg">{item.start_time}</Text>
                  </View>
                  
                  <View className="px-4">
                    <ArrowRight size={16} color="#cbd5e1" />
                  </View>

                  <View className="flex-1 items-center">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Selesai</Text>
                    <Text className="text-slate-900 font-black text-lg">{item.end_time}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View className="h-24" />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] p-8">
            {/* Modal Handle Bar */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-slate-900">Ubah Jadwal</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {editingSchedule && (
              <View className="mb-8 flex-row items-center bg-blue-50 p-4 rounded-2xl">
                <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4 shadow-lg shadow-blue-200">
                   <Calendar size={24} color="white" />
                </View>
                <View>
                   <Text className="text-blue-600 text-[10px] font-bold uppercase">Sesi Praktik Hari</Text>
                   <Text className="text-blue-900 font-black text-xl">{days[editingSchedule.day_of_week].name}</Text>
                </View>
              </View>
            )}

            {/* INPUT TIME SELECTION */}
            <View className="flex-row gap-4 mb-10">
              <View className="flex-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">Jam Mulai</Text>
                <TouchableOpacity
                  onPress={() => openTimePicker("start")}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4"
                >
                  <Clock size={18} color="#3b82f6" />
                  <Text className="text-slate-900 text-lg ml-3 font-bold">{time.start_time || "08:00"}</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">Jam Selesai</Text>
                <TouchableOpacity
                  onPress={() => openTimePicker("end")}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4"
                >
                  <Clock size={18} color="#3b82f6" />
                  <Text className="text-slate-900 text-lg ml-3 font-bold">{time.end_time || "17:00"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="flex-1 py-4 bg-slate-100 rounded-2xl items-center"
              >
                <Text className="text-slate-600 font-bold">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateSchedule}
                className="flex-[2] py-4 bg-blue-600 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-300"
              >
                <Save size={18} color="white" />
                <Text className="text-white font-bold ml-2 text-base text-center">Simpan Perubahan</Text>
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