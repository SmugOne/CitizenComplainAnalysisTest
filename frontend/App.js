import React, { useEffect } from 'react';
import { API_URL } from '@env';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppNavigator /> // Render the AppNavigator component
  );
}