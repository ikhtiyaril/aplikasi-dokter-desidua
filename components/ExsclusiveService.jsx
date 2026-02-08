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
    active: true,
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
      active: typeof service.active === 'boolean' ? service.active : true,
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
        active: !!form.active,
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
      if (updated && updated.id) {
        setServices((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        fetchServices();
      }

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
      <TouchableOpacity
        onPress={() => openEdit(item)}
        className="bg-white rounded-xl p-4 mb-3 border border-blue-100 active:bg-blue-50"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-blue-900 mb-1">
              {item.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-gray-600">
                Rp {typeof item.price === 'number' ? item.price.toLocaleString('id-ID') : item.price}
              </Text>
              <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <Text className="text-sm text-gray-600">
                {item.duration_minutes} mnt
              </Text>
            </View>
          </View>

          <View className="items-end">
            <View
              className={`px-3 py-1.5 rounded-full mb-2 ${
                item.active ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  item.active ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {item.active ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 bg-white">
        <Text className="text-2xl font-bold text-blue-900 mb-1">Layanan Eksklusif</Text>
        <Text className="text-sm text-gray-500">Kelola layanan kesehatan Anda</Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-400 mt-3 text-sm">Memuat layanan...</Text>
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <View className="items-center mt-20">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="medical-outline" size={32} color="#93c5fd" />
                </View>
                <Text className="text-gray-500 text-base">Tidak ada layanan</Text>
                <Text className="text-gray-400 text-sm mt-1">Belum ada data terdaftar</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Modal Edit - Lengkap */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white ">
          <View className="bg-blue-600 px-5 py-4 flex-row items-center justify-between mt-10">
            <View className="flex-row items-center flex-1">
              <Ionicons name="create" size={22} color="white" />
              <Text className="text-lg font-bold text-white ml-2">Edit Layanan</Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              disabled={saving}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 pt-5">
            {/* Nama Layanan */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="bookmark" size={16} color="#2563eb" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Nama Layanan</Text>
              </View>
              <TextInput
                value={form.name}
                editable={false}
                className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500"
              />
              <Text className="text-xs text-gray-400 mt-1 ml-1">Nama tidak dapat diubah</Text>
            </View>

            {/* Deskripsi */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="document-text" size={16} color="#2563eb" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Deskripsi</Text>
              </View>
              <TextInput
                value={form.description}
                onChangeText={(t) => updateForm('description', t)}
                className="border border-blue-200 rounded-lg p-3 bg-white min-h-24"
                multiline
                textAlignVertical="top"
                placeholder="Tambahkan deskripsi..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Durasi & Harga */}
            <View className="flex-row mb-5 space-x-3">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time" size={16} color="#2563eb" />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">Durasi (mnt)</Text>
                </View>
                <TextInput
                  value={form.duration_minutes}
                  onChangeText={(t) => updateForm('duration_minutes', t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  className="border border-blue-200 rounded-lg p-3 bg-white"
                  placeholder="30"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="cash" size={16} color="#2563eb" />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">Harga (Rp)</Text>
                </View>
                <TextInput
                  value={form.price}
                  onChangeText={(t) => updateForm('price', t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  className="border border-blue-200 rounded-lg p-3 bg-white"
                  placeholder="100000"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* URL Gambar */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="image" size={16} color="#2563eb" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">URL Gambar</Text>
              </View>
              <TextInput
                value={form.image_url}
                onChangeText={(t) => updateForm('image_url', t)}
                className="border border-blue-200 rounded-lg p-3 bg-white"
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            {/* Toggle Options */}
            <View className="bg-blue-50 rounded-lg p-4 mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Pengaturan</Text>

              {/* Active */}
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-blue-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-white rounded-lg items-center justify-center mr-3">
                    <Ionicons name="power" size={18} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-gray-800">Active</Text>
                    <Text className="text-xs text-gray-500">Status layanan aktif/tidak</Text>
                  </View>
                </View>
                <Switch
                  value={!!form.active}
                  onValueChange={(v) => updateForm('active', v)}
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={form.active ? '#2563eb' : '#f1f5f9'}
                />
              </View>

              {/* Allow Walk-in */}
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-blue-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-white rounded-lg items-center justify-center mr-3">
                    <Ionicons name="walk" size={18} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-gray-800">Walk-in</Text>
                    <Text className="text-xs text-gray-500">Izinkan tanpa reservasi</Text>
                  </View>
                </View>
                <Switch
                  value={!!form.allow_walkin}
                  onValueChange={(v) => updateForm('allow_walkin', v)}
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={form.allow_walkin ? '#2563eb' : '#f1f5f9'}
                />
              </View>

              {/* Is Live */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-white rounded-lg items-center justify-center mr-3">
                    <Ionicons name="radio" size={18} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-gray-800">Live</Text>
                    <Text className="text-xs text-gray-500">Tampilkan di aplikasi</Text>
                  </View>
                </View>
                <Switch
                  value={!!form.is_live}
                  onValueChange={(v) => updateForm('is_live', v)}
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={form.is_live ? '#2563eb' : '#f1f5f9'}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mb-8">
              <TouchableOpacity
                className={`flex-1 py-3.5 rounded-lg flex-row items-center justify-center ${
                  saving ? 'bg-blue-400' : 'bg-blue-600'
                }`}
                onPress={saveChanges}
                disabled={saving}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-100 py-3.5 px-5 rounded-lg flex-row items-center justify-center"
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