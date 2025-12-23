import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function DashboardRevenue() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const fetchRevenue = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const res = await axios.get(`${API_URL}/api/booking/doctor/revenue`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
console.log(res.data)
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRevenue();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Loading income...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">No revenue data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-6">
      {/* Summary Cards */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="text-gray-500 text-sm">Total Penghasilan</Text>
        <Text className="text-2xl font-bold text-green-600">
          Rp {data.total_doctor_income.toLocaleString("id-ID")}
        </Text>

        <View className="flex-row justify-between mt-4">
          <View>
            <Text className="text-xs text-gray-500">Fee Aplikasi</Text>
            <Text className="font-semibold text-red-500">
              Rp {data.total_app_income.toLocaleString("id-ID")}
            </Text>
          </View>

          <View>
            <Text className="text-xs text-gray-500">Total Booking</Text>
            <Text className="font-semibold">
              {data.total_booking}
            </Text>
          </View>
        </View>
      </View>

      {/* Detail List */}
      <Text className="text-lg font-semibold mb-2">
        Detail Booking
      </Text>

      <FlatList
        data={data.detail}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row justify-between">
              <Text className="font-semibold">
                {item.service_name}
              </Text>
              <Text
                className={`text-xs px-2 py-1 rounded-full ${
                  item.is_live
                    ? "bg-purple-100 text-purple-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {item.is_live ? "LIVE" : "OFFLINE"}
              </Text>
            </View>

            <Text className="text-xs text-gray-500 mt-1">
              Booking: {item.booking_code}
            </Text>

            <View className="flex-row justify-between mt-3">
              <Text className="text-gray-500 text-sm">Harga</Text>
              <Text className="font-medium">
                Rp {item.price.toLocaleString("id-ID")}
              </Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-500 text-sm">Penghasilan Dokter</Text>
              <Text className="font-semibold text-green-600">
                Rp {item.doctor_income.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            Belum ada booking
          </Text>
        }
      />
    </View>
  );
}
