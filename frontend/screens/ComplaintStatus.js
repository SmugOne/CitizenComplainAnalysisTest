import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ComplaintStatus() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const loadComplaints = async () => {
      const stored = await AsyncStorage.getItem('complaints');
      const parsed = stored ? JSON.parse(stored) : [];
      const activeComplaints = parsed.filter(c => c.status !== 'Done'); // Only not done
      setComplaints(activeComplaints);
    };

    const unsubscribe = setInterval(loadComplaints, 1000); // Poll every 1s for updates
    return () => clearInterval(unsubscribe);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Complaint Status</Text>
      {complaints.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No active complaints.</Text>
      ) : complaints.map((complaint, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.label}>Name:</Text>
          <Text>{complaint.name}</Text>

          <Text style={styles.label}>Category:</Text>
          <Text>{complaint.category}</Text>

          <Text style={styles.label}>Details:</Text>
          <Text>{complaint.details}</Text>

          {complaint.location && (
            <View style={styles.section}>
              <Text style={styles.label}>Location:</Text>
              <Text>{complaint.location.address}</Text>
              <Text>
                Lat: {complaint.location.latitude.toFixed(4)}, Long: {complaint.location.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {complaint.image && (
            <Image source={{ uri: complaint.image }} style={styles.image} />
          )}

          <Text style={styles.label}>Date:</Text>
          <Text>{new Date(complaint.date).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontWeight: '600', marginTop: 6 },
  image: { width: '100%', height: 200, marginTop: 10, borderRadius: 8 },
});