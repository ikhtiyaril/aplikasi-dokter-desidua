import { View, Text } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Login from '../components/Login'

const LoginScreen = () => {
  return (
    <ScreenWrapper classname="justify-center items-center">
   
      <Login/>
  
    </ScreenWrapper>
  )
}

export default LoginScreen