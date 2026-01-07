import { registerGlobals } from '@livekit/react-native';
registerGlobals()

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from './Screen/LoginScreen';
import './global.css'
import HomeScreen from './Screen/HomeScreen';
import ManageBookingOfflineScreen from './Screen/ManageBookingOfflineScreen';
import ManageTelemedicineScreen from './Screen/ManageTelemedicineScreen';
import VideoCallScreen from './Screen/VideoCallScreen';
import DoctorSchedule from './components/DoctorSchedule';
import BlockedTime from './components/BlockedTime';
import DashboardRevenueScreen from './Screen/DashboardRevenueScreen';
import MedicalRecordScreen from './Screen/MedicalRecordScreen';
import GeneralScreen from './Screen/GeneralScreen';
import ResetPasswordScreen from './Screen/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
   <>
   <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
       initialRouteName="Login" 
       screenOptions={{ headerShown: false }}
      >
<Stack.Screen name="Login" component={LoginScreen}/>
<Stack.Screen name="Home" component={HomeScreen}/>
<Stack.Screen name="Booking-Offline" component={ManageBookingOfflineScreen}/>
<Stack.Screen name="Booking-Telemedicine" component={ManageTelemedicineScreen}/>
<Stack.Screen name="Doctor-Schedule" component={DoctorSchedule}/>
<Stack.Screen name="Blocked-Time" component={BlockedTime}/>
<Stack.Screen name="Dashboard-Revenue" component={DashboardRevenueScreen}/>
<Stack.Screen name="Medical-Record" component={MedicalRecordScreen}/>
<Stack.Screen name="Video-Call" component={VideoCallScreen}/>
<Stack.Screen name="Reset-Password" component={ResetPasswordScreen}/>
<Stack.Screen name="Settings" component={GeneralScreen}/>








      </Stack.Navigator>
    </NavigationContainer>
   </SafeAreaProvider>
   </>
  );
}


