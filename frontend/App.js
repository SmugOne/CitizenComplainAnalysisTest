import React, { useEffect } from 'react';
import { API_URL } from '@env';
import 'react-native-gesture-handler';
import AppNavigator from './src/components/navigation/AppNavigator'

export default function App() {
  console.log(API_URL);  
  return (
    <Text>API URL: {API_URL}</Text> 
  );
}