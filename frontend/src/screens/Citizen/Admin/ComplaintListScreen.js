// src/screens/Admin/ComplaintListScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

const AdminComplaintListScreen = () => {
  const [complaints, setComplaints] = useState([]);  // Empty array to start with
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Complaint List</Text>
      {complaints.length === 0 ? (
        <Text style={styles.noComplaintsText}>No complaints to show yet.</Text>
      ) : (
        <FlatList
          data={complaints}
          renderItem={({ item }) => (
            <Animated.View entering="fadeInUp" style={styles.card}>
              <Text style={styles.cardText}>{item.description}</Text>
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  noComplaintsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminComplaintListScreen;