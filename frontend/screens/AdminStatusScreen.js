import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminStatusScreen = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const storedData = await AsyncStorage.getItem('complaints');
        const parsedData = storedData ? JSON.parse(storedData) : [];
        setComplaints(parsedData);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };

    fetchComplaints();
  }, []);

  const handleDone = async (index) => {
    try {
      const storedData = await AsyncStorage.getItem('complaints');
      let complaintsArray = storedData ? JSON.parse(storedData) : [];

      complaintsArray.splice(index, 1); // Remove the complaint
      await AsyncStorage.setItem('complaints', JSON.stringify(complaintsArray));
      setComplaints(complaintsArray); // Refresh the UI
    } catch (error) {
      console.error('Error removing complaint:', error);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.text}><Text style={styles.bold}>Name:</Text> {item.name || 'Anonymous'}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Category:</Text> {item.category}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Description:</Text> {item.description}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Urgency:</Text> {item.urgency}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Emphatic Score:</Text> {item.score}</Text>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => handleDone(index)}
      >
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin - Complaint Status</Text>
      <FlatList
        data={complaints}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No complaints found.</Text>}
      />
    </View>
  );
};

export default AdminStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E3F2FD',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0D47A1',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  doneButton: {
    marginTop: 10,
    backgroundColor: '#FFEB3B',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});