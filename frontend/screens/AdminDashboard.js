import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboard({ onNavigate }) {
  const [complaints, setComplaints] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [timer, setTimer] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(Date.now());
    }, 1000); // update every second for timer
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      const storedComplaints = await AsyncStorage.getItem('complaints');
      if (storedComplaints) {
        setComplaints(JSON.parse(storedComplaints));
      }
    };
    fetchComplaints();
  }, [timer]);

  const markAsDone = async (index) => {
    const updated = [...complaints];
    updated[index].done = true;
    updated[index].completedAt = new Date().toISOString();
    await AsyncStorage.setItem('complaints', JSON.stringify(updated));
    setComplaints(updated);
    Alert.alert('Marked as Done', 'The complaint has been marked completed.');
  };

  const calculateDuration = (start) => {
    const startDate = new Date(start);
    const now = new Date();
    const diffMs = now - startDate;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  const filtered = complaints.filter((c) =>
    showCompleted ? c.done : !c.done
  );

  const renderComplaint = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.category} ({item.urgency})</Text>
      <Text>{item.details}</Text>
      <Text>By: {item.name}</Text>
      <Text>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text>Duration: {calculateDuration(item.date)}</Text>
      {item.location && <Text>Location: {item.location.address}</Text>}
      {item.image && (
        <Text
          style={styles.link}
          onPress={() =>
            onNavigate &&
            onNavigate('viewImage', { uri: item.image })
          }
        >
          View Image
        </Text>
      )}
      {!item.done && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => markAsDone(index)}
        >
          <Text style={styles.doneText}>Mark as Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {showCompleted ? 'Completed Complaints' : 'Ongoing Complaints'}
      </Text>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowCompleted(!showCompleted)}
      >
        <Text style={styles.toggleText}>
          {showCompleted ? 'Show Ongoing' : 'Show Completed'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={filtered}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={renderComplaint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', padding: 12 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  doneButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
  },
  doneText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  toggleButton: {
    backgroundColor: '#1976D2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  toggleText: { color: '#fff', fontWeight: 'bold' },
  link: { color: '#1E88E5', marginTop: 6, textDecorationLine: 'underline' },
});