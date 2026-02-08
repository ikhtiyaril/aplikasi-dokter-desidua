import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@env";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  Circle,
  Inbox,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation()
  
  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const res = await axios.get(`${API_URL}/api/notification`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("INI NOTIF")
console.log(res.data)
      setNotifications(res.data);
    } catch (err) {
      console.log("Notif error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      await axios.put(
        `${API_URL}/api/notification/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.log("Read error:", err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      // Mark all unread as read
      await Promise.all(
        unreadIds.map((id) =>
          axios.put(
            `${API_URL}/api/notification/${id}/read`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.log("Mark all read error:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-blue-50 p-6 rounded-full mb-4">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
        <Text className="text-gray-600 font-medium">Memuat notifikasi...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
        className={`mb-3 rounded-2xl overflow-hidden ${
          item.is_read ? "bg-white" : "bg-blue-50/80"
        }`}
        style={{
          shadowColor: item.is_read ? "#000" : "#2563eb",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: item.is_read ? 0.05 : 0.1,
          shadowRadius: 8,
          elevation: item.is_read ? 2 : 4,
        }}
      >
        <View className="flex-row p-4">
          {/* Icon Container */}
          <View
            className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${
              item.is_read ? "bg-gray-100" : "bg-blue-600"
            }`}
          >
            {item.is_read ? (
              <Bell size={22} color="#6b7280" />
            ) : (
              <BellRing size={22} color="white" />
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text
                className={`font-bold text-base flex-1 ${
                  item.is_read ? "text-gray-700" : "text-gray-900"
                }`}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {!item.is_read && (
                <View className="bg-blue-600 w-2.5 h-2.5 rounded-full ml-2 mt-1" />
              )}
            </View>

            <Text
              className={`text-sm leading-5 mb-2 ${
                item.is_read ? "text-gray-500" : "text-gray-700"
              }`}
              numberOfLines={3}
            >
              {item.body}
            </Text>

            {/* Footer Info */}
            <View className="flex-row items-center flex-wrap gap-3 mt-1">
              {item.Booking && (
                <View className="flex-row items-center bg-blue-100/50 px-2.5 py-1 rounded-lg">
                  <Calendar size={12} color="#2563eb" />
                  <Text className="text-xs text-blue-700 font-semibold ml-1">
                    Booking #{item.Booking.id}
                  </Text>
                </View>
              )}

              <Text className="text-xs text-gray-400">
                {formatDate(item.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom indicator for unread */}
        {!item.is_read && (
          <View className="h-1 bg-blue-600 mx-4 mb-2 rounded-full" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
       <View className=" p-6">
                              <Pressable
                                onPress={() => navigation.goBack()}
                                className="flex-row items-center "
                              >
                                <ArrowLeft size={20} color="blue" />
                                <Text className="text-blue-600 ml-2">Kembali</Text>
                              </Pressable>
                            </View>
      <View
        className="bg-blue-600 pt-14 pb-6 px-5 rounded-b-[32px]"
        style={{
          shadowColor: "#1e40af",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold mb-1">
              Notifikasi
            </Text>
            {unreadCount > 0 && (
              <Text className="text-blue-100 text-sm">
                {unreadCount} notifikasi belum dibaca
              </Text>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="bg-white/20 px-4 py-2.5 rounded-xl flex-row items-center"
            >
              <CheckCircle2 size={16} color="white" />
              <Text className="text-white font-semibold ml-2 text-sm">
                Tandai Semua
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-5 pt-5">
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563eb"]}
              tintColor="#2563eb"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <View
                className="bg-blue-50 p-8 rounded-3xl items-center"
                style={{
                  shadowColor: "#2563eb",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                <Inbox size={64} color="#93c5fd" strokeWidth={1.5} />
                <Text className="text-gray-700 text-lg font-bold mt-4 mb-2">
                  Tidak ada notifikasi
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  Notifikasi Anda akan muncul di sini
                </Text>
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
}