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

export default function FloatingFormBlockedTime({
  visible,
  onClose,
  onSubmit,
  initialData,
  doctorId,
  date, // optional initial date
}) {
  const [form, setForm] = useState({
    date: new Date(),
    time_start: "",
    time_end: "",
  });

  const [picker, setPicker] = useState({
    visible: false,
    mode: "time", // 'date' | 'time'
    field: null, // 'date' | 'start' | 'end'
    value: new Date(),
  });

  // =====================
  // Helpers
  // =====================
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

  const dateToTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const dateToYMD = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // =====================
  // Init edit mode
  // =====================
  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date
          ? new Date(initialData.date)
          : new Date(),
        time_start: initialData.time_start || "",
        time_end: initialData.time_end || "",
      });
    } else if (date) {
      setForm((f) => ({ ...f, date: new Date(date) }));
    }
  }, [initialData, date]);

  // =====================
  // Picker Handlers
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

    if (picker.field === "date") {
      setForm((f) => ({ ...f, date: d }));
    }

    if (picker.field === "start") {
      setForm((f) => ({ ...f, time_start: dateToTime(d) }));
    }

    if (picker.field === "end") {
      setForm((f) => ({ ...f, time_end: dateToTime(d) }));
    }

    setPicker((p) => ({ ...p, visible: false }));
  };

  // =====================
  // Submit
  // =====================
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

  // =====================
  // UI
  // =====================
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 justify-center px-4">
        <View className="bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-blue-600 mb-5">
            {initialData ? "Edit Blocked Time" : "Tambah Blocked Time"}
          </Text>

          {/* DATE */}
          <Text className="font-medium mb-1">Tanggal</Text>
          <TouchableOpacity
            onPress={() => openPicker("date", "date")}
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          >
            <Text className="text-base">
              {dateToYMD(form.date)}
            </Text>
          </TouchableOpacity>

          {/* START TIME */}
          <Text className="font-medium mb-1">Jam Mulai</Text>
          <TouchableOpacity
            onPress={() => openPicker("time", "start")}
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          >
            <Text className="text-base">
              {form.time_start || "08:00"}
            </Text>
          </TouchableOpacity>

          {/* END TIME */}
          <Text className="font-medium mb-1">Jam Akhir</Text>
          <TouchableOpacity
            onPress={() => openPicker("time", "end")}
            className="border border-gray-300 rounded-lg px-4 py-3"
          >
            <Text className="text-base">
              {form.time_end || "17:00"}
            </Text>
          </TouchableOpacity>

          {/* ACTIONS */}
          <View className="flex-row justify-end gap-3 mt-6">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              <Text>Tutup</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="px-4 py-2 bg-blue-600 rounded-lg"
            >
              <Text className="text-white font-semibold">
                {initialData ? "Update" : "Simpan"}
              </Text>
            </TouchableOpacity>
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
