import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Citizen Screens
import HomeScreen from "../../screens/Citizen/HomeScreen";
import SubmitComplaintScreen from "../../screens/Citizen/SubmitComplaintScreen";
import TrackComplaintScreen from "../../screens/Citizen/TrackComplaintScreen";
// import ComplaintStatusScreen from "../../screens/Citizen/ComplaintStatusScreen";
import AboutScreen from "../../screens/Citizen/AboutScreen";

// Admin Screens
import AdminLoginScreen from "../../screens/Citizen/Admin/AdminLoginScreen";
import DashboardScreen from "../../screens/Citizen/Admin/DashboardScreen";
import ComplaintListScreen from "../../screens/Citizen/Admin/ComplaintListScreen";
import StatisticsScreen from "../../screens/Citizen/Admin/StatisticsScreen.js";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CitizenHome" screenOptions={{ headerShown: false }}>
        {/* Citizen routes */}
        <Stack.Screen name="CitizenHome" component={HomeScreen} />
        <Stack.Screen name="SubmitComplaint" component={SubmitComplaintScreen} />
        <Stack.Screen name="TrackComplaint" component={TrackComplaintScreen} />
        {/* <Stack.Screen name="ComplaintStatus" component={ComplaintStatusScreen} /> */}
        <Stack.Screen name="AboutScreen" component={AboutScreen} />

        {/* Admin routes*/}
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminDashboard" component={DashboardScreen} />
        <Stack.Screen name="ComplaintList" component={ComplaintListScreen} />
        <Stack.Screen name="StatisticsScreen" component={StatisticsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}