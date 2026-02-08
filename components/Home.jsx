import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions
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
  Clock,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  CloudCogIcon,
  BellRing,
  MapPin,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  User,
  Bell
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- Helper untuk Countdown ---
const CountdownTimer = ({ targetDate, targetTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const target = new Date(`${targetDate}T${targetTime}`);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Sekarang');
        return;
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setTimeLeft(`${days} Hari lagi`);
      } else {
        setTimeLeft(`${hours}j ${minutes}m lagi`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return (
    <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
      <Text className="text-blue-600 text-xs font-bold">{timeLeft}</Text>
    </View>
  );
};

export default function Home() {
  const navigation = useNavigation();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);

  // --- Fetch Data ---
  const fetchDoctorInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const res = await axios.get(`${API_URL}/api/doctor/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("INI BOOKING NIH 2")
      console.log(res.data.data.Bookings)
      setDoctorInfo(res.data.data);
      setBookings(res.data.data.Bookings || []);
      setIsActive(res.data.data.isActive);
    } catch (error) {
      console.log('Fetch error:', error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctorInfo();
     const setupPush = async () => {
        const token = await registerForPushToken();
    
        if (!token) return;
    
        const jwt = await AsyncStorage.getItem("authToken");
    
        await fetch(`${API_URL}/api/notification/register-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ expo_token: token }),
        });
        console.log("jalan")
      };
    
      setupPush();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctorInfo();
  };

  // --- Logic Logout ---
  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    navigation.replace('Login');
  };

  // --- Logic Status Toggle ---
  const handleStatusToggle = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const newStatus = !isActive;
      setIsActive(newStatus);
      
      await axios.put(
        `${API_URL}/api/doctor/status`,
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setIsActive(!isActive);
      console.log('Update status error:', error);
    }
  };

  // --- Filter Bookings Logic ---
  const { urgentBooking, upcomingBooking } = useMemo(() => {
    const now = new Date();
    
    const sortByDate = (a, b) => {
      const dateA = new Date(`${a.date}T${a.time_start}`);
      const dateB = new Date(`${b.date}T${b.time_start}`);
      return dateA - dateB;
    };

    const pendingList = bookings.filter(b => {
      const bookDate = new Date(`${b.date}T${b.time_start}`);
      return b.status === 'pending' && bookDate > now;
    }).sort(sortByDate);

    const upcomingList = bookings.filter(b => {
      const bookDate = new Date(`${b.date}T${b.time_start}`);
      return b.status === 'confirmed' && bookDate > now;
    }).sort(sortByDate);

    return {
      urgentBooking: pendingList[0] || null,
      upcomingBooking: upcomingList[0] || null
    };
  }, [bookings]);

  // --- Handle Navigation to Detail ---
  const handleBookingPress = (booking) => {
    if (!booking) return;
    
    const serviceName = booking.Service?.name?.toLowerCase() || '';
    const isOnline = serviceName.includes('tele') || serviceName.includes('video') || serviceName.includes('online');

    if (isOnline) {
      navigation.navigate('Booking-Telemedicine');
    } else {
      navigation.navigate('Booking-Offline');
    }
  };

  const normalizeImageUrl = (url) => {
    if (!url) return null;
    return url.includes('localhost') ? url.replace(/localhost:\d+/, API_URL.split('//')[1]) : url;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };const getFirstName = (fullName = '') => {
  if (!fullName) return '';

  return fullName
    .trim()
    .split(' ')[0];
};


  // --- Menu Items ---
  const menuItems = [
    { title: 'Offline', subtitle: 'Kelola kunjungan', screen: 'Booking-Offline', icon: ClipboardList, color: '#2563eb' },
    { title: 'Telemedicine', subtitle: 'Video call', screen: 'Booking-Telemedicine', icon: Video, color: '#7c3aed' },
    { title: 'Keuangan', subtitle: 'Pendapatan', screen: 'Dashboard-Revenue', icon: Wallet, color: '#059669' },
    { title: 'Riwayat', subtitle: 'Rekam medis', screen: 'Medical-Record', icon: Users, color: '#d97706' },
    { title: 'Jadwal', subtitle: 'Atur shift', screen: 'Doctor-Schedule', icon: Calendar, color: '#dc2626' },
    { title: 'Block Time', subtitle: 'Tutup jadwal', screen: 'Blocked-Time', icon: Clock, color: '#4b5563' },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- HEADER WITH BUBBLES & DOCTOR PROFILE --- */}
        <View className="bg-blue-600 px-6 pt-12 pb-32 rounded-b-[40px] relative overflow-hidden">
          {/* Decorative Bubbles */}
          <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500 opacity-20" />
          <View className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-blue-700 opacity-10" />
          <View className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-white opacity-10" />

          {/* Header Content */}
          <View className="flex-row justify-between items-center mb-6 relative z-10">
            <View>
              <Text className="text-blue-100 text-sm">Selamat Datang,</Text>
              <Text className="text-white text-2xl font-bold mt-1">Dr. {getFirstName(doctorInfo?.name) || 'Dokter'} 👋</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Settings')}
              className="bg-blue-700 p-2.5 rounded-full"
            >
              <Settings size={22} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
             <TouchableOpacity 
              onPress={() => navigation.navigate('Notification')} 
              className="relative"
            >
              <View className="w-10 h-10 rounded-full bg-blue-700 items-center justify-center">
                <Bell color="white" size={20} />
              </View>           
            </TouchableOpacity>
          </View>

          {/* Doctor Profile Card */}
          <View className="bg-white rounded-3xl p-5 relative z-10 shadow-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-100 mr-4">
                  <Image
                    source={{ uri: normalizeImageUrl(doctorInfo?.avatar) || 'https://i.pravatar.cc/150' }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-lg font-bold" numberOfLines={1}>
                    {doctorInfo?.name || 'Dokter'}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    {doctorInfo?.specialization || 'Dokter Umum'}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <Text className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {isActive ? 'Praktik Aktif' : 'Tidak Praktik'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Switch
                value={isActive}
                onValueChange={handleStatusToggle}
                trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                thumbColor={isActive ? '#2563eb' : '#f1f5f9'}
                style={{ transform: [{ scale: 0.9 }] }}
              />
            </View>
          </View>
        </View>

        {/* --- BOOKING CARDS CAROUSEL --- */}
        {(urgentBooking || upcomingBooking) && (
          <View className="px-6 -mt-24 mb-6" style={{ zIndex: 50 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24 }}
            >
              {/* Card 1: PERLU KONFIRMASI */}
              {urgentBooking && (
                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => handleBookingPress(urgentBooking)}
                  className="bg-white rounded-3xl p-5 mr-4 border-2 border-orange-200 shadow-lg"
                  style={{ width: width - 80 }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center mr-3">
                        <AlertCircle color="white" size={20} />
                      </View>
                      <View>
                        <Text className="font-bold text-gray-900 text-base">Perlu Konfirmasi</Text>
                        <Text className="text-orange-600 text-xs font-semibold">Segera proses booking ini</Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl p-4 mb-3">
                    <View className="flex-row items-center mb-3">
                      <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-3">
                        <User color="#f97316" size={20} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900">
                          Pasien #{urgentBooking.patient_id}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {urgentBooking.Service?.name || 'Layanan Umum'}
                        </Text>
                      </View>
                      <View className="bg-orange-100 px-3 py-1 rounded-full">
                        <Text className="text-orange-700 text-xs font-bold">PENDING</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                      <View className="flex-row items-center">
                        <Clock size={14} color="#6b7280" />
                        <Text className="text-gray-600 text-sm ml-2">
                          {formatDate(urgentBooking.date)}
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-bold">
                        {urgentBooking.time_start?.slice(0, 5)} WIB
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                      <View className={`px-2 py-1 rounded-md ${urgentBooking.payment_status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Text className={`text-xs font-semibold ${urgentBooking.payment_status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
                          {urgentBooking.payment_status === 'paid' ? '✓ Sudah Bayar' : '✗ Belum Bayar'}
                        </Text>
                      </View>
                      <CountdownTimer targetDate={urgentBooking.date} targetTime={urgentBooking.time_start} />
                    </View>
                  </View>

                  <View className="flex-row items-center justify-center">
                    <Text className="text-orange-600 font-bold mr-2">Lihat Detail</Text>
                    <ChevronRight size={18} color="#ea580c" />
                  </View>
                </TouchableOpacity>
              )}

              {/* Card 2: JADWAL TERDEKAT */}
              {upcomingBooking && (
                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => handleBookingPress(upcomingBooking)}
                  className="bg-white  rounded-3xl p-5 mr-4 border-2 border-blue-200 shadow-lg"
                  style={{ width: width - 80 }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center mr-3">
                        <CheckCircle2 color="white" size={20} />
                      </View>
                      <View>
                        <Text className="font-bold text-gray-900 text-base">Jadwal Terdekat</Text>
                        <Text className="text-blue-600 text-xs font-semibold">Sudah dikonfirmasi</Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl p-4 mb-3">
                    <View className="flex-row items-center mb-3">
                      <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <User color="#2563eb" size={20} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900">
                          Pasien #{upcomingBooking.patient_id}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {upcomingBooking.Service?.name || 'Konsultasi'}
                        </Text>
                      </View>
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-700 text-xs font-bold">CONFIRMED</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                      <View className="flex-row items-center">
                        <Clock size={14} color="#2563eb" />
                        <Text className="text-blue-600 font-semibold text-sm ml-2">
                          {formatDate(upcomingBooking.date)}
                        </Text>
                      </View>
                      <Text className="text-blue-600 font-bold">
                        {upcomingBooking.time_start?.slice(0, 5)} WIB
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                      <View className="bg-green-100 px-2 py-1 rounded-md">
                        <Text className="text-xs font-semibold text-green-700">
                          ✓ Pembayaran Lunas
                        </Text>
                      </View>
                      <CountdownTimer targetDate={upcomingBooking.date} targetTime={upcomingBooking.time_start} />
                    </View>
                  </View>

                  <View className="flex-row items-center justify-center">
                    <Text className="text-blue-600 font-bold mr-2">Lihat Detail</Text>
                    <ChevronRight size={18} color="#2563eb" />
                  </View>
                </TouchableOpacity>
              )}

              {/* Placeholder jika tidak ada booking */}
              {!urgentBooking && !upcomingBooking && (
                <View className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-lg items-center justify-center" style={{ width: width - 80, minHeight: 180 }}>
                  <Calendar color="#cbd5e1" size={48} />
                  <Text className="text-gray-400 font-semibold mt-4 text-center">Tidak ada booking aktif</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">Menunggu pasien membuat jadwal</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* --- STATS OVERVIEW --- */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white p-4 rounded-2xl border border-blue-300 shadow-sm">
              <Text className="text-gray-500 text-xs font-medium mb-1">Pasien Hari Ini</Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {bookings.filter(b => b.date === new Date().toISOString().split('T')[0] && b.status !== 'cancelled').length}
              </Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-2xl border border-blue-300 shadow-sm">
              <Text className="text-gray-500 text-xs font-medium mb-1">Total Pending</Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </Text>
            </View>
          </View>
        </View>

        {/* --- MAIN MENU - SINGLE ROW HORIZONTAL --- */}
       <View className="px-6 mb-6">
  <Text className="text-gray-900 font-bold text-lg mb-4">
    Menu Utama
  </Text>

   <View className="space-y-3 gap-3">
    {menuItems.map((item, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => navigation.navigate(item.screen)}
        activeOpacity={0.7}
        className="bg-white p-4 rounded-2xl border border-blue-300 shadow-sm flex-row items-center"
      >
        {/* Icon */}
        <View className="w-12 h-12 rounded-full items-center justify-center bg-gray-50 mr-4">
          <item.icon size={22} color={item.color} strokeWidth={2} />
        </View>

        {/* Text */}
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-lg">
            {item.title}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            {item.subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
</View>


        {/* --- LOGOUT BUTTON --- */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center p-4 rounded-xl bg-red-50 border border-red-100"
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="text-red-500 font-semibold ml-2">Keluar Aplikasi</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}