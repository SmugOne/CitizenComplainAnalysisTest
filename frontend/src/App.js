import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/data")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native + Flask App</Text>
      <Text>{data ? data.message : "Loading..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

