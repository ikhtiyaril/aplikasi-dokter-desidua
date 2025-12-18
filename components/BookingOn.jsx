import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function BookingOn() {
    const navigation = useNavigation()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusStyle = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    confirmed: "bg-green-100 text-green-700 border border-green-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300",
    completed: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  const paymentStyle = {
    paid: "bg-green-100 text-green-700 border border-green-300",
    unpaid: "bg-red-100 text-red-700 border border-red-300",
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken')
      console.log(token)
      const res = await axios.get(`${API_URL}/api/booking/doctor`,{
        headers :{
Authorization : `Bearer ${token}`
        }
    });
    console.log(res.data.data)
const responses = res.data.data
    const dataFilter = responses.filter(s=>(s.Service.is_live ))
      setData(dataFilter);
    } catch (err) {
      console.error("Gagal fetch booking:", err);
      Alert.alert("Error", "Gagal memuat data booking");
    } finally {
      setLoading(false);
    }
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
              className="bg-green-600 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs text-center">Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateStatus(item.id, "cancelled")}
              className="bg-red-600 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      case "confirmed":
        return (
          <TouchableOpacity
            onPress={() => updateStatus(item.id, "completed")}
            className="bg-blue-600 px-3 py-1 rounded"
          >
            <Text className="text-white text-xs text-center">Complete</Text>
          </TouchableOpacity>
        );
      case "cancelled":
        return (
          <TouchableOpacity
            onPress={() => updateStatus(item.id, "pending")}
            className="bg-yellow-600 px-3 py-1 rounded"
          >
            <Text className="text-white text-xs text-center">Activate</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const handleCall = async (booking_id)=>{
    const token = await AsyncStorage.getItem('authToken')
const res = await axios.get(`${API_URL}/api/call/${booking_id}`,
    {
        headers :{
            Authorization : `Bearer ${token}`
        }
    }
)
const tokenRoom = res.data.token 
navigation.navigate('Video-Call',{tokenRoom})
  }
  return (
    <ScrollView className="p-4 bg-blue-50 flex-1">
      <Text className="text-2xl font-bold mb-4">Booking Monitoring Dashboard</Text>
      {loading && <Text className="text-center text-gray-500 mb-4">Loading...</Text>}

      {data.map((item) => (
        <View
          key={item.id}
          className="bg-white/50 border border-white/20 rounded-2xl p-4 mb-4 shadow-md"
        >
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600 font-semibold">{item.booking_code}</Text>
            <View className="flex-row gap-2">
              <Text className={`${statusStyle[item.status]} px-3 py-1 rounded-full text-xs font-semibold`}>
                {item.status}
              </Text>
              <Text className={`${paymentStyle[item.payment_status]} px-3 py-1 rounded-full text-xs font-semibold`}>
                {item.payment_status}
              </Text>
            </View>
          </View>

          <View className="grid grid-cols-2 gap-1">
            <Text><Text className="font-semibold">Patient:</Text> {item.patient?.name}</Text>
            <Text><Text className="font-semibold">Service:</Text> {item.Service?.name}</Text>
            <Text><Text className="font-semibold">Doctor:</Text> {item.Doctor?.name || "-"}</Text>
            <Text><Text className="font-semibold">Date:</Text> {item.date}</Text>
            <Text><Text className="font-semibold">Time:</Text> {item.time_start} - {item.time_end}</Text>
          </View>

          <View className="mt-3">{renderActions(item)}</View>
          <View><TouchableOpacity className="bg-blue-600" onPress={()=>handleCall(item.id)}> Klik Video Call </TouchableOpacity></View>
        </View>
      ))}
    </ScrollView>
  );
}
