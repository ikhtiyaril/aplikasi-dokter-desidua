import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { 
  Calendar, 
  Clock, 
  X, 
  Save, 
  Clock3, 
  AlertTriangle, 
  CheckCircle2 
} from "lucide-react-native";

export default function FloatingFormBlockedTime({
  visible,
  onClose,
  onSubmit,
  initialData,
  doctorId,
  date: initialDate,
  existingBlocks = [], // Prop penting untuk cek bentrok
}) {
  const [form, setForm] = useState({
    date: new Date(),
    time_start: "08:00",
    time_end: "09:00",
  });

  const [picker, setPicker] = useState({
    visible: false,
    mode: "time",
    field: null,
    value: new Date(),
  });

  // =====================
  // Helpers
  // =====================
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const dateToTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const dateToYMD = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // Helper konversi jam "HH:mm" ke total menit untuk perbandingan
  const toMin = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // =============================
  // LOGIC: CEK BENTROK (OVERLAP)
  // =============================
  const isConflict = useMemo(() => {
    const newStart = toMin(form.time_start);
    const newEnd = toMin(form.time_end);
    const selectedDateStr = dateToYMD(form.date);

    return existingBlocks.some((block) => {
      // Kecualikan data yang sedang diedit agar tidak bentrok dengan dirinya sendiri
      if (initialData && block.id === initialData.id) return false;

      const blockDateStr = block.date; // Pastikan formatnya YYYY-MM-DD
      
      if (selectedDateStr === blockDateStr) {
        const existStart = toMin(block.time_start);
        const existEnd = toMin(block.time_end);
        
        // Rumus Overlap: (MulaiA < SelesaiB) && (SelesaiA > MulaiB)
        return newStart < existEnd && newEnd > existStart;
      }
      return false;
    });
  }, [form.date, form.time_start, form.time_end, existingBlocks, initialData]);

  // =====================
  // Init Data
  // =====================
  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date ? new Date(initialData.date) : new Date(),
        time_start: initialData.time_start || "08:00",
        time_end: initialData.time_end || "09:00",
      });
    } else if (initialDate) {
      setForm((f) => ({ ...f, date: new Date(initialDate) }));
    }
  }, [initialData, initialDate, visible]);

  // =====================
  // Picker Handlers
  // =====================
  const openPicker = (mode, field) => {
    let value = new Date(form.date);
    if (field === "start" && form.time_start) {
      const [h, m] = form.time_start.split(":");
      value.setHours(h, m);
    } else if (field === "end" && form.time_end) {
      const [h, m] = form.time_end.split(":");
      value.setHours(h, m);
    }
    setPicker({ visible: true, mode, field, value });
  };

  const onChangePicker = (event, selectedDate) => {
    if (Platform.OS === "android") setPicker((p) => ({ ...p, visible: false }));
    if (!selectedDate && event.type !== 'dismissed') return;
    
    const d = selectedDate || picker.value;
    if (picker.field === "date") setForm((f) => ({ ...f, date: d }));
    if (picker.field === "start") setForm((f) => ({ ...f, time_start: dateToTime(d) }));
    if (picker.field === "end") setForm((f) => ({ ...f, time_end: dateToTime(d) }));
    setPicker((p) => ({ ...p, visible: false }));
  };

  const handleSubmit = () => {
    if (isConflict) return;
    if (toMin(form.time_start) >= toMin(form.time_end)) {
      Alert.alert("Error", "Jam akhir harus lebih besar dari jam mulai");
      return;
    }

    onSubmit({
      doctor_id: doctorId,
      date: dateToYMD(form.date),
      time_start: form.time_start,
      time_end: form.time_end,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-end mb-10">
        <View className="bg-white rounded-t-[40px] shadow-xl overflow-hidden">
          {/* Header */}
          <View className="bg-blue-600 px-8 pt-8 pb-6 flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-black text-white">
                {initialData ? "Edit Blokir" : "Blokir Waktu"}
              </Text>
              <Text className="text-blue-100 text-xs mt-1">Atur jadwal tidak tersedia Anda</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-white/20 p-2 rounded-full">
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="p-8">
            {/* DATE FIELD */}
            <View className="mb-6">
              <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest">
                Tanggal Blokir
              </Text>
              <TouchableOpacity
                onPress={() => openPicker("date", "date")}
                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4"
              >
                <Calendar size={20} color="#3b82f6" />
                <Text className="text-slate-800 text-base ml-4 font-bold">
                  {form.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* TIME RANGE FIELDS */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest">
                  Mulai
                </Text>
                <TouchableOpacity
                  onPress={() => openPicker("time", "start")}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4"
                >
                  <Clock size={18} color="#3b82f6" />
                  <Text className="text-slate-900 text-lg ml-3 font-bold">{form.time_start}</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1 tracking-widest">
                  Selesai
                </Text>
                <TouchableOpacity
                  onPress={() => openPicker("time", "end")}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4"
                >
                  <Clock3 size={18} color="#3b82f6" />
                  <Text className="text-slate-900 text-lg ml-3 font-bold">{form.time_end}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* STATUS/VALIDATION BOX */}
            {isConflict ? (
              <View className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center mb-8">
                <View className="bg-red-100 p-2 rounded-full mr-3">
                  <AlertTriangle size={18} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-red-700 font-bold text-sm">Waktu Sudah Terblokir</Text>
                  <Text className="text-red-500 text-xs">Jadwal ini bentrok dengan sesi lain.</Text>
                </View>
              </View>
            ) : (
              <View className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex-row items-center mb-8">
                <View className="bg-emerald-100 p-2 rounded-full mr-3">
                  <CheckCircle2 size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-700 font-bold text-sm">Waktu Tersedia</Text>
                  <Text className="text-emerald-500 text-xs">Anda dapat memblokir slot waktu ini.</Text>
                </View>
              </View>
            )}

            {/* ACTION BUTTONS */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-4 bg-slate-100 rounded-2xl items-center justify-center"
              >
                <Text className="text-slate-600 font-bold text-base">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isConflict}
                activeOpacity={0.8}
                className={`flex-[2] py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
                  isConflict ? "bg-slate-300" : "bg-blue-600 shadow-blue-400"
                }`}
              >
                {!isConflict && <Save size={20} color="white" />}
                <Text className="text-white font-black text-base ml-2">
                  {isConflict ? "Terblokir" : (initialData ? "Simpan" : "Konfirmasi")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {picker.visible && (
        <DateTimePicker
          value={picker.value}
          mode={picker.mode}
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangePicker}
        />
      )}
    </Modal>
  );
}