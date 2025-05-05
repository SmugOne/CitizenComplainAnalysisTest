import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.68.76:5000/api/data')  // Replace with your IP to function
      .then((response) => response.json())
      .then((json) => {
        console.log("Received from Flask:", json);
        setData(json);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text>Message: {data?.message}</Text>
          <Text>Status: {data?.status}</Text>
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}


// Styles:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6DA2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});