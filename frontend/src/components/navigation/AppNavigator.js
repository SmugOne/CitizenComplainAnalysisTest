import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import HomeScreen from '../../screens/Citizen/HomeScreen';
import ComplaintFormScreen from '../../screens/Citizen/ComplaintFormScreen';
// import ComplaintHistoryScreen from '../../screens/Citizen/ComplaintHistoryScreen';
// import ComplaintStatusScreen from '../../screens/Citizen/ComplaintStatusScreen';
import AdminLoginScreen from '../../screens/Citizen/Admin/AdminLoginScreen';
import ComplaintListScreen from '../../screens/Citizen/Admin/ComplaintListScreen';
import DashboardScreen from '../../screens/Citizen/Admin/DashboardScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Complaint Form" component={ComplaintFormScreen} />
        {/* <Stack.Screen name="Complaint History" component={ComplaintHistoryScreen} />
        <Stack.Screen name="Complaint Status" component={ComplaintStatusScreen} /> */}
        <Stack.Screen name="Admin Login" component={AdminLoginScreen} />
        <Stack.Screen name="Admin Complaint List" component={ComplaintListScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;