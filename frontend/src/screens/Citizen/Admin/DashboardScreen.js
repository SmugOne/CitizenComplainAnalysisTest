import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const AdminDashboardScreen = () => {
  const [totalComplaints, setTotalComplaints] = useState('');
  const [resolvedComplaints, setResolvedComplaints] = useState('');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Animated.View entering="fadeInUp" style={styles.card}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.stats}>Total Complaints: {totalComplaints}</Text>
        <Text style={styles.stats}>Resolved Complaints: {resolvedComplaints}</Text>

        <View style={styles.buttonSpacing}>
          <Button
            title="Manage Complaints"
            onPress={() => navigation.navigate('Admin Complaint List')}
          />
        </View>

        <View style={styles.buttonSpacing}>
          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  stats: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  buttonSpacing: {
    marginTop: 15,
  },
});

export default AdminDashboardScreen;