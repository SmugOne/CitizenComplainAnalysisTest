import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { API_URL } from '@env'; // Load from .env
import 'react-native-gesture-handler'; // Required for navigation gestures
import AppNavigator from './src/components/navigation/AppNavigator'; // Navigation (optional if used)

export default function App() {

  useEffect(() => {
    console.log("API_URL:", API_URL);

    // Example payload for the request
    const FrontEndData = {
      message: "This is a test complaint",
      location: "Sample Location"
    };

    // POST request only if API_URL is defined
    if (API_URL) {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(FrontEndData)
      })
        .then(response => response.json())
        .then(data => console.log("Response from backend:", data))
        .catch(error => console.error("Error posting to backend:", error));
    } else {
      console.warn("API_URL is not defined");
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>API URL: {API_URL}</Text>

      {/* Uncomment this if you want to render your navigation instead of just the Text */}
      {/* <AppNavigator /> */}
    </View>
  );
}

