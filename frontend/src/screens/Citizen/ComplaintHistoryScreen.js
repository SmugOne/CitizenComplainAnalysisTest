import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ComplaintHistoryScreen = () => {

  const [complaints, setComplaints] = useState([]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint History</Text>

      {complaints.length === 0 ? (
        <Text style={styles.noComplaintsText}>No complaints submitted yet.</Text>
      ) : (
        <FlatList
          data={complaints}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.description}</Text>
            </View>
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
  },
  noComplaintsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
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
});

export default ComplaintHistoryScreen;