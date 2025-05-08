import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, StatusBar } from 'react-native';
import CitizenHome from './screens/CitizenHome';
import SubmitComplaint from './screens/SubmitComplaint';
import ComplaintStatus from './screens/ComplaintStatus';
import AdminLogin from './screens/AdminLogin';
import AdminDashboard from './screens/AdminDashboard';
import AdminStatusScreen from './screens/AdminStatusScreen';
import TopNavBar from './components/TopNavBar';

export default function App() {
  const [screen, setScreen] = useState('home');

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <CitizenHome onNavigate={setScreen} />;
      case 'submit':
        return <SubmitComplaint onBack={() => setScreen('home')} />;
      case 'status':
        return <ComplaintStatus onBack={() => setScreen('home')} />;
      case 'adminLogin':
        return <AdminLogin onSuccess={() => setScreen('adminDashboard')} />;
      case 'adminDashboard':
        return <AdminDashboard onNavigate={setScreen} />;
      case 'adminStatus':
        return <AdminStatusScreen />;
      default:
        return <CitizenHome onNavigate={setScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
      <TopNavBar onNavigate={setScreen} currentScreen={screen} />
      <View style={styles.screenContainer}>{renderScreen()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue background
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
});