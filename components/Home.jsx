import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env';


export default function Home() {
  const navigation = useNavigation();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking,setBooking] = useState([]);


  useEffect(()=>{
    const loginCheck = async ()=>{
  const token = await AsyncStorage.getItem('authToken')
  console.log('INI TOKENNYA')
  console.log(token)
  if(!token){
    navigation.navigate('Login')
  }
    }
    loginCheck()

  },[])

const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    navigation.replace('Login');
  } catch (error) {
    console.log('Logout error:', error);
  }
};


  const menuItems = [
    { title: 'Daftar Booking Offline', screen: 'Booking-Offline', icon: '📋' },
    { title: 'Daftar Layanan Video Call', screen: 'Booking-Telemedicine', icon: '📹' },
    { title: 'Dashboard Penghasilan', screen: 'Dashboard-Revenue', icon: '💰' },
    { title: 'Daftar Riwayat Pasien', screen: 'Medical-Record', icon: '📊' },
    { title: 'Schedule Dokter', screen: 'Doctor-Schedule', icon: '📅' },
    { title: 'Block Waktu', screen: 'Blocked-Time', icon: '🔒' },
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
      console.log("===DATA RES DOCTOR===")
console.log(res.data)

      setDoctorInfo(res.data.data);
      setBooking(res.data.data.Bookings)
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
    return url.replace(
      /http:\/\/localhost:\d+/,
      API_URL
    );
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
    // asumsi b.date format: YYYY-MM-DD
    return b.date === today && b.status !== 'cancelled';
  }).length;
};

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">

      {/* HEADER */}
      <View className="bg-blue-600 px-6 pt-12 pb-8">
        <Text className="text-white text-sm opacity-90">Dashboard</Text>
        <Text className="text-white text-3xl font-bold mt-1">Selamat Datang</Text>
      </View>

      {/* PROFILE CARD */}
      <View className="mx-6 -mt-6 bg-white rounded-2xl shadow-lg p-5">
        <View className="flex-row items-center">

          {/* AVATAR */}
          <View className="relative">
            <Image
              source={{
                uri: normalizeImageUrl(doctorInfo?.avatar) || 'https://i.pravatar.cc/150',
              }}
              className="w-16 h-16 rounded-full"
            />
            <View
              className={`absolute bottom-0 right-0 w-4 h-4 ${
                isActive ? 'bg-green-500' : 'bg-gray-400'
              } rounded-full border-2 border-white`}
            />
          </View>

          {/* INFO */}
          <View className="flex-1 ml-4">
            <Text className="text-gray-900 text-lg font-bold">
              {doctorInfo?.name || 'Dokter'}
            </Text>
            <Text className="text-gray-500 text-sm">
              {doctorInfo?.specialist || 'Spesialis'}
            </Text>
          </View>

          {/* STATUS */}
          <View className="items-end">
            <Text
              className={`text-xs font-semibold mb-1 ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {isActive ? 'Aktif' : 'Nonaktif'}
            </Text>
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
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-gray-500 text-xs">Pasien Hari Ini</Text>
<Text className="text-gray-900 text-2xl font-bold">
  {todayPatients(booking)}
</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-gray-500 text-xs">Pending</Text>
          <Text className="text-blue-600 text-2xl font-bold">{pendingBook(booking)}</Text>
        </View>
      </View>

      {/* MENU */}
      <View className="mx-6 mt-6">
        <Text className="text-gray-900 text-base font-bold mb-3">
          Menu Utama
        </Text>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl mb-3 shadow-sm flex-row items-center p-4"
            onPress={() => navigation.navigate(item.screen)}
          >
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
              <Text className="text-lg">{item.icon}</Text>
            </View>

            <Text className="flex-1 text-gray-900 font-semibold ml-4">
              {item.title}
            </Text>

            <Text className="text-gray-400 text-xl">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-8" />
      <View className="mx-6 mt-6">
  <TouchableOpacity
    onPress={handleLogout}
    className="bg-white border border-red-200 rounded-xl p-4 m-10 items-center"
  >
    <Text className="text-red-500 font-semibold">
      Keluar Akun
    </Text>
  </TouchableOpacity>
</View>

    </ScrollView>
  );
}
