import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Layout from "../../../components/LayoutAdmin";

// Dummy complaints for demo
const complaints = [
  { id: "C-00123", status: "Pending", category: "Infrastructure" },
  { id: "C-00124", status: "Resolved", category: "Public Services" },
  { id: "C-00125", status: "On Going", category: "Environment" },
];

export default function ComplaintListScreen({ navigation }) {
  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>Complaint List</Text>
        <Text style={styles.subtitle}>View and manage all submitted complaints.</Text>
        <ScrollView style={{ width: "100%" }}>
          {complaints.length === 0 ? (
            <Text style={{ color: "#888", textAlign: "center", marginTop: 20 }}>
              No complaints (not available)
            </Text>
          ) : (
            complaints.map((item, idx) => (
              <View style={styles.listItem} key={item.id}>
                <View>
                  <Text style={styles.complaintId}>ID: {item.id}</Text>
                  <Text style={styles.catText}>Category: {item.category}</Text>
                </View>
                <Text>Status: {item.status}</Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("ComplaintStatus", { complaintId: item.id })}
                >
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: "100%",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#11493f", marginBottom: 10 },
  subtitle: { color: "#11493f", marginBottom: 16 },
  listItem: {
    backgroundColor: "#f3ead3",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  complaintId: { fontWeight: "700", color: "#11493f" },
  catText: { color: "#197278", fontSize: 13 },
  actionButton: {
    backgroundColor: "#197278",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 10,
  },
  actionButtonText: { color: "#fff", fontWeight: "700" },
});