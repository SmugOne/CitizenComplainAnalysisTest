import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { FadeInUp } from 'react-native-reanimated';

const AdminComplaintListScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  fetch('http://192.168.68.73:5000/api/complaints')
    .then(async (response) => {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return JSON.parse(text);  // manually parse now that you logged it
    })
    .then(data => {
      setComplaints(data);
      setLoading(false);
      setError(null);
    })
    .catch(error => {
      console.error('Error fetching complaints:', error);
      setError(error.message);
      setLoading(false);
    });
}, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prioritized List</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
          Error: {error}
        </Text>
      ) : complaints.length === 0 ? (
        <Text style={styles.noComplaintsText}>No complaints to show yet.</Text>
      ) : (
        <FlatList
          data={complaints}
          renderItem={({ item }) => (
            <Animated.View entering={FadeInUp} style={styles.card}>
              <Text style={styles.cardText}>
                <Text style={{ fontWeight: 'bold' }}>Name: </Text>{item.Name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={{ fontWeight: 'bold' }}>Complaint: </Text>{item.Complaint}
              </Text>
              <Text style={styles.cardText}>
                <Text style={{ fontWeight: 'bold' }}>Location: </Text>{item.Location}
              </Text>
              <Text style={styles.cardText}>
                <Text style={{ fontWeight: 'bold' }}>Agency: </Text>{item.PredictedAgency}
              </Text>
             <Button title="Done" onPress={() => { /**/ }} />
</Animated.View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noComplaintsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default AdminComplaintListScreen;
