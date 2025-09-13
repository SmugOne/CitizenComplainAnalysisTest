import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Layout from "../../components/Layout";

export default function ComplaintHistoryScreen({ navigation }) {
  // Placeholder, later to be replaced by backend connection
  const complaints = [];

  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>Complaint History</Text>
        <Text style={styles.subtitle}>
          View your previous complaints and their statuses.
        </Text>
      </View>
      <View style={styles.historyList}>
        {complaints.length === 0 ? (
          <Text style={{ color: "#888", textAlign: "center" }}>No complaints (not available)</Text>
        ) : (
          complaints.map((c, i) => (
            <View style={styles.historyItem} key={i}>
              <Text style={styles.complaintId}>ID: {c.id}</Text>
              <Text style={styles.historyStatus}>{c.status}</Text>
            </View>
          ))
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fbf3df", padding: 22, borderRadius: 12, marginBottom: 18 },
  title: { fontSize: 28, textAlign: "center", fontWeight: "800", color: "#11493f" },
  subtitle: { marginTop: 8, textAlign: "center", color: "#11493f" },
  historyList: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ece6d5",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ece6d5",
  },
  complaintId: { color: "#11493f", fontWeight: "700" },
  historyStatus: { color: "#197278", fontWeight: "600" },
});