import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function CitizenHome({ onNavigate }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citizen Complaint Program</Text>
      <TouchableOpacity style={styles.button} onPress={() => onNavigate('submit')}>
        <Text style={styles.buttonText}>Submit a Complaint</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onNavigate('status')}>
        <Text style={styles.buttonText}>Track Complaint Status</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.adminButton} onPress={() => onNavigate('adminLogin')}>
        <Text style={styles.adminButtonText}>Admin Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#E8F1FF',
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  button: {
    backgroundColor: '#FFD93D',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#1E1E1E',
  },
  adminButton: {
    marginTop: 20,
    padding: 10,
    alignSelf: 'center',
  },
  adminButtonText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});