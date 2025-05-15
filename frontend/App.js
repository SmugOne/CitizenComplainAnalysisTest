import React, { useEffect } from 'react';
import { API_URL } from '@env';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

//Path to screens
import HomeScreen from './src/screens/Citizen/HomeScreen';
import ComplaintFormScreen from './src/screens/Citizen/ComplaintFormScreen';
import ComplaintStatusScreen from './src/screens/Citizen/ComplaintStatusScreen';
import ComplaintHistoryScreen from './src/screens/Citizen/ComplaintHistoryScreen';
import AdminLoginScreen from './src/screens/Citizen/Admin/AdminLoginScreen';
import ComplaintListScreen from './src/screens/Citizen/Admin/ComplaintListScreen';
import DashboardScreen from './src/screens/Citizen/Admin/DashboardScreen';

const Stack = createStackNavigator();

// Get API URL
export default function App() {
  useEffect(() => {
    console.log("API_URL:", API_URL);

    const FrontEndData = {
      message: "This is a test complaint",
      location: "Sample Location"
    };

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

  //Set navigation 
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Complaint Form" component={ComplaintFormScreen} />
        <Stack.Screen name="Complaint History" component={ComplaintHistoryScreen} />
        <Stack.Screen name="Complaint Status" component={ComplaintStatusScreen} />
        <Stack.Screen name="Admin Login" component={AdminLoginScreen} />
        <Stack.Screen name="Complaint List" component={ComplaintListScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
