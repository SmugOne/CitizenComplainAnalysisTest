import React from 'react';
import 'react-native-gesture-handler'; // Required for navigation gestures
import AppNavigator from './src/components/navigation/AppNavigator'; // Import AppNavigator

export default function App() {
  return (
    <AppNavigator /> // Render the AppNavigator component
  );
}