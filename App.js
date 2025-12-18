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







      </Stack.Navigator>
    </NavigationContainer>
   </SafeAreaProvider>
   </>
  );
}


