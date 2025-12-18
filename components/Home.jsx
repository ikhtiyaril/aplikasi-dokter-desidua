import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();
  const [isActive, setIsActive] = useState(true);

  const handleStatusToggle = () => setIsActive(!isActive);

  const menuItems = [
    { title: 'Daftar Booking Offline', screen: 'Booking-Offline' },
    { title: 'Daftar Layanan Video Call', screen: 'Booking-Telemedicine' },
    { title: 'Dashboard Penghasilan', screen: 'EarningsDashboard' },
    { title: 'Daftar Riwayat Pasien', screen: 'PatientHistory' },
    { title: 'Schedule Dokter', screen: 'PatientHistory' },

    
  ];

  return (
    <ScrollView className="flex-1 bg-blue-50">
      
      {/* HEADER */}
      <View className="bg-blue-600 p-4 rounded-b-2xl">
        <Text className="text-white text-2xl font-bold">Selamat Datang, Dokter</Text>
      </View>

      {/* PROFILE CARD */}
      <View className="bg-white m-4 p-4 rounded-xl shadow">
        <View className="flex-row items-center">
          <Image
            source={{ uri: 'https://via.placeholder.com/80' }}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-xl font-semibold">Dr. Ikhtiyaril Ikhsan</Text>
            <Text className="text-gray-500">Spesialis IT Klinik</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-700 mr-2">Active</Text>
            <Switch
              value={isActive}
              onValueChange={handleStatusToggle}
              thumbColor={isActive ? '#3B82F6' : '#ccc'}
              trackColor={{ false: '#ccc', true: '#93C5FD' }}
            />
          </View>
        </View>
      </View>

      {/* MENU ITEMS */}
      <View className="m-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-blue-100 p-4 rounded-xl mb-3 shadow"
            onPress={() => {
              if (item.screen) {
                navigation.navigate(item.screen);
              }
            }}
          >
            <Text className="text-blue-700 font-medium text-lg">
              {item.title || ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}
