// src/screens/Citizen/ComplaintStatusScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

const ComplaintStatusScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Complaint Status</Text>
        <Text style={styles.status}>Your complaint is being reviewed.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
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
  status: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
});

export default ComplaintStatusScreen;