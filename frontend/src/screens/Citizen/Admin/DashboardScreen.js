import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { FadeInUp } from 'react-native-reanimated';

const AdminDashboardScreen = () => {
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [resolvedComplaints, setResolvedComplaints] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetch('http://172.17.24.34:5000/api/complaints')
      .then(async (response) => {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return JSON.parse(text);
      })
      .then(data => {
        setTotalComplaints(data.length);
      })
      .catch(error => {
        console.error('Error fetching total complaints:', error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp} style={styles.card}>
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
          title="View Resolved Complaints"
          onPress={() => {
            // Future implementation
          }}
        />
        </View>

        <View style={styles.buttonSpacing}>
          <Button
            title="Log Out"
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
    backgroundColor: '#e6f0ff',
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