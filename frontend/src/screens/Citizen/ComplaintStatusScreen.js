import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Layout from "../../components/Layout";

export default function ComplaintStatusScreen({ navigation }) {
  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>Complaint Status</Text>
        <Text style={styles.subtitle}>
          Complaint status will be shown here (not available yet).
        </Text>
      </View>
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Status: Not available</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fbf3df", padding: 22, borderRadius: 12, marginBottom: 18 },
  title: { fontSize: 28, textAlign: "center", fontWeight: "800", color: "#11493f" },
  subtitle: { marginTop: 8, textAlign: "center", color: "#11493f" },
  statusBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ece6d5",
    alignItems: "center",
  },
  statusTitle: { color: "#197278", fontWeight: "700", fontSize: 20, marginBottom: 6 },
});