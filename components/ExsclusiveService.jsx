import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';

export default function ExclusiveService() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    duration_minutes: '',
    price: '',
    allow_walkin: false,
    is_live: false,
    image_url: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/api/service/doctor/services/exclusive`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(res.data.data || []);
    } catch (err) {
      console.error('fetchServices error', err?.response || err?.message || err);
      Alert.alert('Error', 'Gagal memuat layanan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  function openEdit(service) {
    setSelected(service);
    setForm({
      name: service.name || '',
      description: service.description || '',
      duration_minutes: String(service.duration_minutes ?? ''),
      price: String(service.price ?? ''),
      allow_walkin: !!service.allow_walkin,
      is_live: !!service.is_live,
      image_url: service.image_url || '',
    });
    setModalVisible(true);
  }

  function updateForm(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function saveChanges() {
    if (!selected) return;
    const duration = parseInt(form.duration_minutes || '0', 10);
    const price = parseInt(form.price || '0', 10);

    if (Number.isNaN(duration) || duration <= 0) {
      return Alert.alert('Validasi', 'Durasi harus berupa angka (> 0).');
    }
    if (Number.isNaN(price) || price < 0) {
      return Alert.alert('Validasi', 'Harga tidak valid.');
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('authToken');
      const payload = {
        name: form.name,
        description: form.description,
        duration_minutes: duration,
        price: price,
        allow_walkin: form.allow_walkin,
        is_live: form.is_live,
        image_url: form.image_url,
      };

      const res = await axios.put(
        `${API_URL}/api/service/doctor/services/${selected.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data.data || res.data;
      setServices((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      Alert.alert('Sukses', 'Perubahan berhasil disimpan.');
      setModalVisible(false);
    } catch (err) {
      console.error('saveChanges error', err?.response || err?.message || err);
      const message = err?.response?.data?.message || 'Gagal menyimpan perubahan.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  }

  function renderItem({ item }) {
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-blue-100">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-bold text-blue-900 mb-1">{item.name}</Text>
            {item.description ? (
              <Text className="text-sm text-gray-600 leading-5">{item.description}</Text>
            ) : null}
          </View>
          
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center"
            onPress={() => openEdit(item)}
          >
            <Ionicons name="create-outline" size={16} color="white" />
            <Text className="text-white ml-1 font-medium">Edit</Text>
          </TouchableOpacity>
        </View>

        <View className="border-t border-blue-50 pt-3 space-y-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="time-outline" size={18} color="#2563eb" />
            </View>
            <Text className="text-sm text-gray-700 flex-1">
              Durasi: <Text className="font-semibold text-blue-900">{item.duration_minutes} menit</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="cash-outline" size={18} color="#2563eb" />
            </View>
            <Text className="text-sm text-gray-700 flex-1">
              Harga: <Text className="font-semibold text-blue-900">Rp {typeof item.price === 'number' ? item.price.toLocaleString('id-ID') : item.price}</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="walk-outline" size={18} color="#2563eb" />
            </View>
            <Text className="text-sm text-gray-700 flex-1">
              Walk-in: <Text className={`font-semibold ${item.allow_walkin ? 'text-green-600' : 'text-gray-500'}`}>
                {item.allow_walkin ? 'Tersedia' : 'Tidak Tersedia'}
              </Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="radio-outline" size={18} color="#2563eb" />
            </View>
            <Text className="text-sm text-gray-700 flex-1">
              Status: <Text className={`font-semibold ${item.is_live ? 'text-green-600' : 'text-gray-500'}`}>
                {item.is_live ? 'Aktif' : 'Nonaktif'}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <View className="px-4 pt-4 pb-2 bg-white border-b border-blue-100">
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
            <Ionicons name="medkit" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-blue-900">Layanan Eksklusif</Text>
            <Text className="text-xs text-gray-600 mt-0.5">Kelola informasi layanan kesehatan</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-3">Memuat layanan...</Text>
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="items-center mt-12">
                <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="medical-outline" size={40} color="#93c5fd" />
                </View>
                <Text className="text-gray-500 text-base">Tidak ada layanan eksklusif</Text>
                <Text className="text-gray-400 text-sm mt-1">Belum ada layanan terdaftar</Text>
              </View>
            )}
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="bg-blue-600 px-4 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons name="create" size={24} color="white" />
              <Text className="text-xl font-bold text-white ml-3">Edit Layanan</Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              disabled={saving}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 pt-5">
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="bookmark-outline" size={18} color="#2563eb" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Nama Layanan</Text>
              </View>
              <TextInput
                value={form.name}
                editable={false}
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-gray-500"
              />
              <Text className="text-xs text-gray-400 mt-1">Nama tidak dapat diubah</Text>
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="document-text-outline" size={18} color="#2563eb" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Deskripsi</Text>
              </View>
              <TextInput
                value={form.description}
                onChangeText={(t) => updateForm('description', t)}
                className="border border-blue-200 rounded-xl p-3 bg-white min-h-24"
                multiline
                textAlignVertical="top"
                placeholder="Tambahkan deskripsi layanan..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="flex-row mb-4 space-x-3">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time-outline" size={18} color="#2563eb" />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">Durasi (menit)</Text>
                </View>
                <TextInput
                  value={form.duration_minutes}
                  onChangeText={(t) => updateForm('duration_minutes', t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  className="border border-blue-200 rounded-xl p-3 bg-white"
                  placeholder="30"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="cash-outline" size={18} color="#2563eb" />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">Harga (Rp)</Text>
                </View>
                <TextInput
                  value={form.price}
                  onChangeText={(t) => updateForm('price', t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  className="border border-blue-200 rounded-xl p-3 bg-white"
                  placeholder="100000"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

       

            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="image-outline" size={18} color="#2563eb" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">URL Gambar</Text>
              </View>
              <TextInput
                value={form.image_url}
                onChangeText={(t) => updateForm('image_url', t)}
                className="border border-blue-200 rounded-xl p-3 bg-white"
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            <View className="flex-row space-x-3 mb-8">
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl flex-row items-center justify-center ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={saveChanges}
                disabled={saving}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-100 py-4 px-6 rounded-xl flex-row items-center justify-center"
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Ionicons name="close-circle-outline" size={20} color="#6b7280" />
                <Text className="text-gray-700 font-semibold ml-2">Batal</Text>
              </TouchableOpacity>
            </View>

            <View className="h-8" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}