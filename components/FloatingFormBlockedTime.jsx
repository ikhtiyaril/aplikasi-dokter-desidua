import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
// Pastikan anda sudah menginstal lucide-react-native atau sesuaikan dengan library icon anda
import { Calendar, Clock, X, Save, Clock3 } from "lucide-react-native";

export default function FloatingFormBlockedTime({
  visible,
  onClose,
  onSubmit,
  initialData,
  doctorId,
  date,
}) {
  const [form, setForm] = useState({
    date: new Date(),
    time_start: "",
    time_end: "",
  });

  const [picker, setPicker] = useState({
    visible: false,
    mode: "time",
    field: null,
    value: new Date(),
  });

  // =====================
  // Helpers (Logic Tetap)
  // =====================
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const dateToTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const dateToYMD = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // =====================
  // Init edit mode (Logic Tetap)
  // =====================
  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date ? new Date(initialData.date) : new Date(),
        time_start: initialData.time_start || "",
        time_end: initialData.time_end || "",
      });
    } else if (date) {
      setForm((f) => ({ ...f, date: new Date(date) }));
    }
  }, [initialData, date]);

  // =====================
  // Picker Handlers (Logic Tetap)
  // =====================
  const openPicker = (mode, field) => {
    let value = new Date();
    if (field === "date") value = form.date;
    if (field === "start" && form.time_start)
      value.setHours(...form.time_start.split(":"));
    if (field === "end" && form.time_end)
      value.setHours(...form.time_end.split(":"));

    setPicker({ visible: true, mode, field, value });
  };

  const onChangePicker = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setPicker((p) => ({ ...p, visible: false }));
      if (!selectedDate) return;
    }
    const d = selectedDate || picker.value;
    if (picker.field === "date") setForm((f) => ({ ...f, date: d }));
    if (picker.field === "start") setForm((f) => ({ ...f, time_start: dateToTime(d) }));
    if (picker.field === "end") setForm((f) => ({ ...f, time_end: dateToTime(d) }));
    setPicker((p) => ({ ...p, visible: false }));
  };

  const handleSubmit = () => {
    if (!form.time_start || !form.time_end) {
      Alert.alert("Error", "Jam mulai & jam akhir wajib diisi");
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
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center px-6">
        <View className="bg-white rounded-[24px] overflow-hidden shadow-xl">
          {/* Header */}
          <View className="bg-blue-600 px-6 py-4 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-white">
              {initialData ? "Edit Blocked Time" : "Tambah Blocked Time"}
            </Text>
            <TouchableOpacity onPress={onClose} className="bg-white/20 p-1 rounded-full">
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="p-6">
            {/* DATE FIELD */}
            <View className="mb-5">
              <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-1">
                Pilih Tanggal
              </Text>
              <TouchableOpacity
                onPress={() => openPicker("date", "date")}
                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
              >
                <Calendar size={20} color="#3b82f6" />
                <Text className="text-slate-800 text-base ml-3 font-medium">
                  {dateToYMD(form.date)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* TIME RANGE FIELDS */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-1">
                  Jam Mulai
                </Text>
                <TouchableOpacity
                  onPress={() => openPicker("time", "start")}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                >
                  <Clock size={18} color="#3b82f6" />
                  <Text className="text-slate-800 text-base ml-2 font-medium">
                    {form.time_start || "08:00"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-1">
                  Jam Akhir
                </Text>
                <TouchableOpacity
                  onPress={() => openPicker("time", "end")}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                >
                  <Clock3 size={18} color="#ef4444" />
                  <Text className="text-slate-800 text-base ml-2 font-medium">
                    {form.time_end || "17:00"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* INFO BOX */}
            <View className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex-row items-start">
              <View className="bg-blue-100 p-2 rounded-full mr-3">
                 <Clock size={14} color="#2563eb" />
              </View>
              <Text className="text-blue-700 text-[12px] flex-1 leading-5">
                Pastikan jam yang diblokir tidak bentrok dengan jadwal konsultasi yang sudah ada.
              </Text>
            </View>

            {/* ACTION BUTTONS */}
            <View className="flex-row gap-3 mt-8">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-4 bg-slate-100 rounded-xl items-center justify-center"
              >
                <Text className="text-slate-600 font-bold">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                className="flex-[2] py-4 bg-blue-600 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-400"
              >
                <Save size={18} color="white" className="mr-2" />
                <Text className="text-white font-bold text-base ml-2">
                  {initialData ? "Simpan Perubahan" : "Konfirmasi"}
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
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangePicker}
        />
      )}
    </Modal>
  );
}