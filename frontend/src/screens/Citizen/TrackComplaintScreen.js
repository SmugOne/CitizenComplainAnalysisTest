import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Layout from "../../components/Layout";

const demoStatusDB = {
  "C-00123": "Resolved",
  "C-00124": "In Progress",
};

export default function TrackComplaintScreen({ route, navigation }) {
  const [inputId, setInputId] = useState(route?.params?.complaintId || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleTrack = () => {
    if (!inputId.trim()) {
      setStatus("");
      setError("Please enter a Complaint ID.");
      return;
    }
    if (demoStatusDB[inputId.trim()]) {
      setStatus(demoStatusDB[inputId.trim()]);
      setError("");
    } else {
      setStatus("");
      setError("No complaint found with that ID.");
    }
  };

  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>Track a Complaint</Text>
        <Text style={styles.subtitle}>
          Enter your complaint ID below to check the status of your complaint.
        </Text>
      </View>
      <View style={styles.trackBox}>
        <Text style={styles.label}>Complaint ID:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={styles.input}
            value={inputId}
            onChangeText={setInputId}
            placeholder="Enter Complaint ID"
          />
          <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
            <Text style={styles.trackBtnText}>Track</Text>
          </TouchableOpacity>
        </View>
        {error ? (
          <View style={styles.resultCard}>
            <Text style={[styles.statusText, { color: "red" }]}>{error}</Text>
          </View>
        ) : status ? (
          <View style={styles.resultCard}>
            <Text style={[styles.statusText, { color: "#197278" }]}>
              Complaint Status: {status}
            </Text>
          </View>
        ) : null}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fbf3df", padding: 22, borderRadius: 12, marginBottom: 18 },
  title: { fontSize: 28, textAlign: "center", fontWeight: "800", color: "#11493f" },
  subtitle: { marginTop: 8, textAlign: "center", color: "#11493f" },
  trackBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ece6d5",
  },
  label: { fontWeight: "700", color: "#11493f", marginBottom: 6 },
  input: {
    flex: 1,
    backgroundColor: "#f3ead3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 0,
    marginRight: 8,
  },
  trackBtn: {
    backgroundColor: "#197278",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  trackBtnText: { color: "#fff", fontWeight: "bold" },
  resultCard: {
    backgroundColor: "#e8f0ea",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  statusText: { color: "#11493f", fontStyle: "italic" },
});