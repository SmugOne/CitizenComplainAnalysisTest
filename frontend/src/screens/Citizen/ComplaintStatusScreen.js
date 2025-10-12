import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Layout from "../../components/Layout";
import { API_URL } from "@env";

export default function ComplaintStatusScreen({ navigation }) {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [complaintData, setComplaintData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setError("");
    setComplaintData(null);

    const response = await fetch(`${API_URL}/api/complaints`);
    const data = await response.json();

    //Convert searchId to number to match stored IDs
    const found = data.find((item) => Number(item.ID) === Number(searchId.trim()));

    if (found) {
      setComplaintData(found);
    } else {
      setError("Complaint ID not found or does not exist.");
    }
  }

  const renderStatus = (status) => {
    if (status === "UNSOLVED") return "Under Review";
    if (status === "SOLVED") return "Solved";
    return "Under Review";
  };

  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>Complaint Status</Text>
        <Text style={styles.subtitle}>
          Enter your Complaint ID to check its status.
        </Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Enter Complaint ID"
          keyboardType="numeric"
          value={searchId}
          onChangeText={setSearchId}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchBtnText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : complaintData ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Complaint ID: {complaintData.ID}</Text>
          <Text style={styles.complaintText}>{complaintData.Complaint}</Text>
          <Text style={styles.statusText}>
            Status: {renderStatus(complaintData.Status)}
          </Text>
        </View>
      ) : null}
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
  complaintText: { color: "#11493f", fontSize: 16, textAlign: "center", marginBottom: 8 },
  statusText: { color: "#11493f", fontWeight: "700", fontSize: 18 },
});