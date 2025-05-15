import React from 'react';
import {View, Text, StyleSheet } from 'react-native';
import { API_URL } from 'react-native-dotenv';
import 'react-native-gesture-handler'; // Required for navigation gestures
import AppNavigator from './src/components/navigation/AppNavigator'; // Import AppNavigator

console.log("API URL from env:", API_URL); 

// env
fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(FrontEndData)
})
//env

export default function App() {
  console.log(API_URL);  
  return (
    <Text>API URL: {API_URL}</Text> 
  );
}