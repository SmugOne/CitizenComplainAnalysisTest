import React from 'react';
import { Text } from 'react-native';
import { API_URL } from 'react-native-dotenv';
import 'react-native-gesture-handler'; // Required for navigation gestures
import AppNavigator from './src/components/navigation/AppNavigator'; // Import AppNavigator

export default function App() {
  console.log(API_URL);  
  return (
    <Text>API URL: {API_URL}</Text> 
  );
}