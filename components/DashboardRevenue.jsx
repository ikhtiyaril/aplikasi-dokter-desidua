import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { 
  Wallet, 
  TrendingUp, 
  ArrowDownToLine, 
  Info,
  X,
  Building2,
  CreditCard,
  User,
  DollarSign
} from "lucide-react-native";

export default function DoctorWalletScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [wallet, setWallet] = useState(0);
  const [summary, setSummary] = useState(null);
  const [income, setIncome] = useState([]);
  const [withdraws, setWithdraws] = useState([]);

  const [activeTab, setActiveTab] = useState("income");

  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    bank_name: "",
    bank_account: "",
    account_name: "",
  });
const [proofModalVisible, setProofModalVisible] = useState(false);
const [selectedProof, setSelectedProof] = useState(null);

const BACKEND = `https://backend.desidua.cloud/`
  // ===============================
  // FETCH WALLET + INCOME
  // ===============================
  const fetchWallet = async () => {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.get(`${API_URL}/api/revenue/doctor/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setWallet(res.data.wallet_balance);
    setSummary(res.data.summary);
    setIncome(res.data.transactions || []);
  };

  // ===============================
  // FETCH WITHDRAW HISTORY
  // ===============================
  const fetchWithdraws = async () => {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.get(`${API_URL}/api/revenue/doctor/withdraw`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setWithdraws(res.data.data || []);
  };

  const fetchAll = async () => {
    try {
      await Promise.all([fetchWallet(), fetchWithdraws()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // ===============================
  // SUBMIT WITHDRAW
  // ===============================
  const submitWithdraw = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      await axios.post(
        `${API_URL}/api/revenue/doctor/withdraw`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalVisible(false);
      setForm({
        amount: "",
        bank_name: "",
        bank_account: "",
        account_name: "",
      });

      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4 pt-6">

      {/* ===============================
          WALLET CARD - BLUE THEME
      =============================== */}
      <View className="bg-blue-500 rounded-3xl p-6 shadow-lg mb-5">
        <View className="flex-row items-center mb-3">
          <View className="bg-white/20 p-2 rounded-full mr-3">
            <Wallet size={24} color="#ffffff" />
          </View>
          <Text className="text-blue-100 text-sm font-medium">Saldo Tersedia</Text>
        </View>

        <Text className="text-4xl font-bold text-white mt-1 mb-2">
          Rp {wallet.toLocaleString("id-ID")}
        </Text>

        {summary && (
          <View className="flex-row items-center mt-1">
            <TrendingUp size={14} color="#93c5fd" />
            <Text className="text-xs text-blue-100 ml-1">
              {summary.total_transaction} transaksi · Total Rp {summary.total_doctor_income.toLocaleString("id-ID")}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="mt-5 bg-white py-3.5 rounded-xl flex-row items-center justify-center shadow-md"
        >
          <ArrowDownToLine size={20} color="#2563eb" />
          <Text className="text-blue-600 text-center font-bold ml-2">
            Request Withdraw
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===============================
          TAB MENU - BLUE THEME
      =============================== */}
      <View className="flex-row bg-white rounded-2xl mb-4 shadow-sm p-1">
        {[
          { key: "income", label: "Riwayat Penghasilan", icon: TrendingUp },
          { key: "withdraw", label: "Riwayat Withdraw", icon: ArrowDownToLine },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
              activeTab === tab.key
                ? "bg-blue-600"
                : "bg-transparent"
            }`}
          >
            <tab.icon 
              size={18} 
              color={activeTab === tab.key ? "#ffffff" : "#9ca3af"} 
            />
            <Text
              className={`text-center font-semibold ml-2 text-xs ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-gray-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===============================
          RIWAYAT PENGHASILAN - BLUE THEME
      =============================== */}
      {activeTab === "income" && (
        <FlatList
          data={income}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#2563eb"
            />
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-blue-100">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="font-bold text-gray-800 text-base">{item.service_name}</Text>
                  <Text className="text-xs text-blue-600 mt-1">
                    {item.service_type} · Dokter {item.revenue_split.doctor_percent}%
                  </Text>
                </View>
                <View className="bg-blue-100 p-2 rounded-full">
                  <DollarSign size={18} color="#2563eb" />
                </View>
              </View>

              <View className="bg-blue-50 rounded-xl p-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Harga Layanan</Text>
                  <Text className="font-semibold text-gray-800">
                    Rp {item.price.toLocaleString("id-ID")}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600 text-sm font-medium">
                    Penghasilan Dokter
                  </Text>
                  <Text className="font-bold text-blue-600 text-base">
                    Rp {item.revenue_amount.doctor_income.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <View className="bg-blue-100 p-4 rounded-full mb-3">
                <TrendingUp size={32} color="#60a5fa" />
              </View>
              <Text className="text-center text-gray-400">
                Belum ada penghasilan
              </Text>
            </View>
          }
        />
      )}

      {/* ===============================
          RIWAYAT WITHDRAW - BLUE THEME WITH INFO
      =============================== */}
      {activeTab === "withdraw" && (
        <View className="flex-1">
          {/* Info Button */}
          <TouchableOpacity 
            onPress={() => setInfoModalVisible(true)}
            className="bg-blue-100 rounded-xl p-3 mb-3 flex-row items-center"
          >
            <Info size={20} color="#2563eb" />
            <Text className="text-blue-700 font-medium ml-2 flex-1">
              Informasi Penting tentang Withdraw
            </Text>
          </TouchableOpacity>

          <FlatList
            data={withdraws}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor="#2563eb"
              />
            }
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-blue-100">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 p-2 rounded-full mr-3">
                      <ArrowDownToLine size={20} color="#2563eb" />
                    </View>
                    <View>
                      <Text className="font-bold text-gray-800 text-lg">
                        Rp {Number(item.amount).toLocaleString("id-ID")}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`px-3 py-1.5 rounded-full ${
                      item.status === "paid"
                        ? "bg-green-100"
                        : item.status === "rejected"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        item.status === "paid"
                          ? "text-green-700"
                          : item.status === "rejected"
                          ? "text-red-700"
                          : "text-yellow-700"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="bg-blue-50 rounded-xl p-3">
                  <View className="flex-row items-center mb-2">
                    <Building2 size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-700 ml-2 font-medium">
                      {item.bank_name}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <CreditCard size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-700 ml-2">
                      {item.bank_account}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <User size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-700 ml-2">
                      {item.account_name}
                    </Text>
                  </View>
                </View>

               {item.status === "paid" && item.proof_image && (
  <TouchableOpacity 
    onPress={() => {
      setSelectedProof(item.proof_image);
      console.log("Gambarnya")
      console.log(item.proof_image)
      setProofModalVisible(true);
    }}
    className="mt-3 flex-row items-center bg-blue-600 p-3 rounded-xl justify-center shadow-sm"
  >
    <Info size={16} color="#ffffff" />
    <Text className="text-xs text-white ml-2 font-bold">
      Lihat Bukti Pembayaran
    </Text>
  </TouchableOpacity>
)}
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <View className="bg-blue-100 p-4 rounded-full mb-3">
                  <ArrowDownToLine size={32} color="#60a5fa" />
                </View>
                <Text className="text-center text-gray-400">
                  Belum ada withdraw
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* ===============================
          MODAL INFO
      =============================== */}
      <Modal 
        visible={infoModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="bg-blue-100 p-2 rounded-full mr-3">
                  <Info size={24} color="#2563eb" />
                </View>
                <Text className="font-bold text-lg text-gray-800">
                  Informasi Penting
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setInfoModalVisible(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-blue-50 rounded-2xl p-4 mb-4">
              <Text className="text-gray-700 leading-6">
                Setelah withdraw dikonfirmasi, dana akan diproses ke rekening Anda dalam 1-3 hari kerja.
              </Text>
            </View>

            <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <Text className="text-amber-800 font-semibold mb-2">
                ⚠️ Perhatian
              </Text>
              <Text className="text-gray-700 leading-6">
                Jika withdraw sudah dikonfirmasi tetapi uang tidak masuk ke rekening Anda, segera hubungi <Text className="font-bold text-blue-600">Customer Service</Text> kami untuk bantuan lebih lanjut.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setInfoModalVisible(false)}
              className="mt-5 bg-blue-600 py-3.5 rounded-xl"
            >
              <Text className="text-white text-center font-bold">
                Mengerti
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===============================
          MODAL WITHDRAW - BLUE THEME
      =============================== */}
    <Modal visible={modalVisible} transparent animationType="slide">
      {/* 1. TouchableWithoutFeedback agar keyboard tertutup saat klik di luar area input */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50 justify-end mb-60">
          
          {/* 2. KeyboardAvoidingView dengan behavior yang tepat */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View className="bg-white rounded-t-[32px] p-6 pb-10">
              {/* Handle bar untuk estetika bottom sheet */}
              <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-6" />

              {/* 3. Gunakan ScrollView agar jika layar kecil, input tetap bisa diakses */}
              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* HEADER */}
                <View className="flex-row items-center mb-6">
                  <View className="bg-blue-100 p-2.5 rounded-2xl mr-4">
                    <ArrowDownToLine size={24} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="font-bold text-xl text-gray-900">Request Withdraw</Text>
                    <Text className="text-gray-500 text-xs">Pastikan data rekening sudah benar</Text>
                  </View>
                </View>

                {/* FORM JUMLAH */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2 ml-1">
                    <DollarSign size={16} color="#6b7280" />
                    <Text className="text-gray-600 font-semibold ml-2">Jumlah</Text>
                  </View>
                  <TextInput
                    placeholder="Contoh: 50000"
                    value={form.amount}
                    keyboardType="numeric"
                    onChangeText={(v) => setForm({ ...form, amount: v })}
                    className="border border-blue-100 rounded-2xl px-4 py-4 bg-slate-50 text-gray-800 font-medium focus:border-blue-500"
                  />
                </View>

                {/* BANK */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2 ml-1">
                    <Building2 size={16} color="#6b7280" />
                    <Text className="text-gray-600 font-semibold ml-2">Nama Bank</Text>
                  </View>
                  <TextInput
                    placeholder="Contoh: BCA, Mandiri, BNI"
                    value={form.bank_name}
                    onChangeText={(v) => setForm({ ...form, bank_name: v })}
                    className="border border-blue-100 rounded-2xl px-4 py-4 bg-slate-50 text-gray-800 font-medium focus:border-blue-500"
                  />
                </View>

                {/* REKENING */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2 ml-1">
                    <CreditCard size={16} color="#6b7280" />
                    <Text className="text-gray-600 font-semibold ml-2">Nomor Rekening</Text>
                  </View>
                  <TextInput
                    placeholder="Masukkan nomor rekening"
                    value={form.bank_account}
                    keyboardType="numeric"
                    onChangeText={(v) => setForm({ ...form, bank_account: v })}
                    className="border border-blue-100 rounded-2xl px-4 py-4 bg-slate-50 text-gray-800 font-medium focus:border-blue-500"
                  />
                </View>

                {/* NAMA PEMILIK */}
                <View className="mb-8">
                  <View className="flex-row items-center mb-2 ml-1">
                    <User size={16} color="#6b7280" />
                    <Text className="text-gray-600 font-semibold ml-2">Nama Pemilik Rekening</Text>
                  </View>
                  <TextInput
                    placeholder="Masukkan nama pemilik"
                    value={form.account_name}
                    onChangeText={(v) => setForm({ ...form, account_name: v })}
                    className="border border-blue-100 rounded-2xl px-4 py-4 bg-slate-50 text-gray-800 font-medium focus:border-blue-500"
                  />
                </View>

                {/* BUTTONS */}
                <TouchableOpacity
                  onPress={submitWithdraw}
                  activeOpacity={0.8}
                  className="bg-blue-600 py-4 rounded-2xl shadow-lg shadow-blue-300"
                >
                  <Text className="text-white text-center font-bold text-lg">
                    Kirim Request
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  className="mt-4 py-2"
                >
                  <Text className="text-center text-gray-400 font-bold">
                    Batal
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

<Modal
  visible={proofModalVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setProofModalVisible(false)}
>
  <View className="flex-1 bg-black/90 justify-center items-center p-4">
    <TouchableOpacity 
      onPress={() => setProofModalVisible(false)}
      className="absolute top-12 right-6 z-10 bg-white/20 p-2 rounded-full"
    >
      <X size={28} color="#ffffff" />
    </TouchableOpacity>
    
    {selectedProof && (
      <View className="w-full h-3/4 bg-white rounded-2xl overflow-hidden">
        <Image 
          source={{ uri: selectedProof }} 
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
    )}
    
    <Text className="text-white mt-4 font-medium text-base">Bukti Transfer</Text>
  </View>
</Modal>

    </View>
  );
}