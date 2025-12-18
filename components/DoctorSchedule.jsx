import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

export default function ManageDoctorSchedule() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [form, setForm] = useState({
    id: null,
    doctor_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    break_start: "",
    break_end: "",
  });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const fetchDoctors = async () => {
    const res = await axios.get(`${API_URL}/api/doctor`);
    setDoctors(res.data.data);
  };

  const fetchSchedules = async () => {
    const res = await axios.get(`${API_URL}/api/doctor-schedule`);
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const handleSubmit = async () => {
    if (!form.doctor_id || !form.day_of_week || !form.start_time || !form.end_time) {
      Alert.alert("Error", "Please complete required fields");
      return;
    }

    try {
      if (form.id) {
        await axios.put(`${API_URL}/api/doctor-schedule/${form.id}`, form);
      } else {
        await axios.post(`${API_URL}/api/doctor-schedule`, form);
      }

      setForm({
        id: null,
        doctor_id: "",
        day_of_week: "",
        start_time: "",
        end_time: "",
        break_start: "",
        break_end: "",
      });

      fetchSchedules();
    } catch (err) {
      Alert.alert("Error", "Failed to save schedule");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm", "Delete this schedule?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await axios.delete(`${API_URL}/api/doctor-schedule/${id}`);
          fetchSchedules();
        },
      },
    ]);
  };

  return (
    <View className="p-4 space-y-6 bg-white flex-1">
      <Text className="text-2xl font-bold">Manage Doctor Schedule</Text>

      {/* Filter Doctor */}
      <Picker
        selectedValue={selectedDoctor}
        onValueChange={(v) => setSelectedDoctor(v)}
        className="bg-gray-100 rounded"
      >
        <Picker.Item label="All Doctors" value="" />
        {doctors.map((d) => (
          <Picker.Item key={d.id} label={d.name} value={d.id} />
        ))}
      </Picker>

      {/* Form */}
      <View className="bg-gray-100 p-4 rounded space-y-3">
        <Picker
          selectedValue={form.doctor_id}
          onValueChange={(v) => setForm({ ...form, doctor_id: v })}
        >
          <Picker.Item label="Select Doctor" value="" />
          {doctors.map((d) => (
            <Picker.Item key={d.id} label={d.name} value={d.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={form.day_of_week}
          onValueChange={(v) => setForm({ ...form, day_of_week: v })}
        >
          <Picker.Item label="Select Day" value="" />
          {days.map((d, i) => (
            <Picker.Item key={i} label={d} value={i} />
          ))}
        </Picker>

        {["start_time", "end_time", "break_start", "break_end"].map((field) => (
          <TextInput
            key={field}
            placeholder={field.replace("_", " ")}
            value={form[field]}
            onChangeText={(v) => setForm({ ...form, [field]: v })}
            className="bg-white border p-3 rounded"
          />
        ))}

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 py-3 rounded flex-row justify-center items-center gap-2"
        >
          <Ionicons name="save" size={20} color="white" />
          <Text className="text-white font-semibold">
            {form.id ? "Update" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={schedules.filter((s) =>
          selectedDoctor ? s.doctor_id == selectedDoctor : true
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="border p-3 rounded mb-3">
            <Text className="font-bold">{item.Doctor?.name}</Text>
            <Text>{days[item.day_of_week]}</Text>
            <Text>
              {item.start_time} - {item.end_time}
            </Text>

            <View className="flex-row gap-4 mt-2">
              <TouchableOpacity
                onPress={() => setForm(item)}
              >
                <Ionicons name="create" size={22} color="blue" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
