import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env';
import {
  Calendar,
  Video,
  Wallet,
  ClipboardList,
  CalendarClock,
  Clock,
  Users,
  AlertCircle,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

export default function Home() {
  const navigation = useNavigation();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState([]);

  useEffect(() => {
    const loginCheck = async () => {
      const token = await AsyncStorage.getItem('authToken');
      console.log('INI TOKENNYA');
      console.log(token);
      if (!token) {
        navigation.navigate('Login');
      }
    };
    loginCheck();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      navigation.replace('Login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const menuItems = [
    { 
      title: 'Daftar Booking Offline', 
      screen: 'Booking-Offline', 
      icon: ClipboardList,
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    { 
      title: 'Daftar Layanan Video Call', 
      screen: 'Booking-Telemedicine', 
      icon: Video,
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    { 
      title: 'Dashboard Penghasilan', 
      screen: 'Dashboard-Revenue', 
      icon: Wallet,
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      title: 'Daftar Riwayat Pasien', 
      screen: 'Medical-Record', 
      icon: Users,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    { 
      title: 'Schedule Dokter', 
      screen: 'Doctor-Schedule', 
      icon: Calendar,
      color: '#ef4444',
      bgColor: '#fee2e2'
    },
    { 
      title: 'Block Waktu', 
      screen: 'Blocked-Time', 
      icon: Clock,
      color: '#6b7280',
      bgColor: '#f3f4f6'
    },
  ];

  /* ================= FETCH DOCTOR ================= */
  const fetchDoctorInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const res = await axios.get(`${API_URL}/api/doctor/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("===DATA RES DOCTOR===");
      console.log(res.data);

      setDoctorInfo(res.data.data);
      setBooking(res.data.data.Bookings);
      setIsActive(res.data.data.isActive);
    } catch (error) {
      console.log('Fetch doctor error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const handleStatusToggle = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const newStatus = !isActive;

      await axios.put(
        `${API_URL}/api/doctor/status`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsActive(newStatus);
      setDoctorInfo(prev => ({ ...prev, isActive: newStatus }));
    } catch (error) {
      console.log('Update status error:', error);
    }
  };

  const normalizeImageUrl = (url) => {
    if (!url) return null;

    if (url.includes('localhost')) {
      return url.replace(/http:\/\/localhost:\d+/, API_URL);
    }

    return url;
  };

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        navigation.replace("Login");
        return;
      }

      await fetchDoctorInfo();
    };

    init();
  }, [navigation]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const pendingBook = (bookings = []) => {
    return bookings.filter(b => b.status === 'pending').length;
  };

  const todayPatients = (bookings = []) => {
    const today = getTodayDate();

    return bookings.filter(b => {
      return b.date === today && b.status !== 'cancelled';
    }).length;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-blue-50">

      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-12 pb-20 rounded-b-3xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-blue-100 text-sm font-medium">Dashboard</Text>
            <Text className="text-white text-3xl font-bold mt-1">
              Selamat Datang
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            className="bg-blue-500 p-3 rounded-2xl"
          >
            <Settings size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* PROFILE CARD */}
      <View className="mx-6 -mt-12 bg-white rounded-3xl p-6 border border-blue-100">
        <View className="flex-row items-center">

          {/* AVATAR */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')} 
            className="relative"
          >
            <View className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-100">
              <Image
                source={{
                  uri: normalizeImageUrl(doctorInfo?.avatar) || 'https://i.pravatar.cc/150',
                }}
                className="w-full h-full"
              />
            </View>
            <View
              className={`absolute -bottom-1 -right-1 w-6 h-6 ${
                isActive ? 'bg-green-500' : 'bg-gray-400'
              } rounded-full border-3 border-white items-center justify-center`}
            >
              <View className="w-2 h-2 bg-white rounded-full" />
            </View>
          </TouchableOpacity>

          {/* INFO */}
          <TouchableOpacity 
            className="flex-1 ml-4" 
            onPress={() => navigation.navigate('Settings')}
          >
            <Text className="text-gray-900 text-lg font-bold">
              {doctorInfo?.name || 'Dokter'}
            </Text>
            <Text className="text-blue-600 text-sm font-medium mt-1">
              {doctorInfo?.specialization || 'Spesialis'}
            </Text>
          </TouchableOpacity>

          {/* STATUS TOGGLE */}
          <View className="items-end">
            <View className="flex-row items-center mb-2">
              <View className={`w-2 h-2 rounded-full mr-2 ${
                isActive ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <Text
                className={`text-xs font-bold ${
                  isActive ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {isActive ? 'AKTIF' : 'NONAKTIF'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleStatusToggle}
              thumbColor="#fff"
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            />
          </View>
        </View>
      </View>

      {/* STATS */}
      <View className="flex-row mx-6 mt-6 gap-3">
        {/* PASIEN HARI INI */}
        <View className="flex-1 bg-white rounded-2xl p-5 border border-blue-100">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-blue-100 p-2 rounded-xl">
              <Users size={20} color="#2563eb" strokeWidth={2} />
            </View>
          </View>
          <Text className="text-gray-500 text-xs font-medium mb-1">
            Pasien Hari Ini
          </Text>
          <Text className="text-gray-900 text-3xl font-bold">
            {todayPatients(booking)}
          </Text>
        </View>

        {/* PENDING */}
        <View className="flex-1 bg-white rounded-2xl p-5 border border-blue-100">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-amber-100 p-2 rounded-xl">
              <AlertCircle size={20} color="#f59e0b" strokeWidth={2} />
            </View>
          </View>
          <Text className="text-gray-500 text-xs font-medium mb-1">
            Menunggu
          </Text>
          <Text className="text-amber-600 text-3xl font-bold">
            {pendingBook(booking)}
          </Text>
        </View>
      </View>

      {/* MENU */}
      <View className="mx-6 mt-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-lg font-bold">
            Menu Utama
          </Text>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-600 text-xs font-semibold">
              {menuItems.length} Menu
            </Text>
          </View>
        </View>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-2xl mb-3 flex-row items-center p-4 border border-blue-100"
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: item.bgColor }}
            >
              <item.icon size={24} color={item.color} strokeWidth={2} />
            </View>

            <Text className="flex-1 text-gray-900 font-semibold ml-4 text-base">
              {item.title}
            </Text>

            <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
          </TouchableOpacity>
        ))}
      </View>

      {/* LOGOUT */}
      <View className="mx-6 mt-4 mb-8">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white border-2 border-red-200 rounded-2xl p-4 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
          <Text className="text-red-500 font-bold ml-2 text-base">
            Keluar Akun
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}