import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Layout from "../../../components/Layout";

// Dummy data (replace with backend integration later)
const categoryData = [
  { label: "Infrastructure", count: 40, color: "#197278" },
  { label: "Public Services", count: 25, color: "#11493f" },
  { label: "Safety & Security", count: 15, color: "#D97706" },
  { label: "Environment", count: 10, color: "#059669" },
  { label: "Administrative Issues", count: 5, color: "#A21CAF" },
  { label: "Community Concerns", count: 5, color: "#E11D48" },
];
const barData = [
  { label: "On Going", count: 30, color: "#2563EB" },
  { label: "Accomplished", count: 50, color: "#16A34A" },
  { label: "Failed", count: 10, color: "#DC2626" },
];

export default function DashboardScreen({ navigation }) {
  const maxBar = Math.max(...barData.map((d) => d.count), 1);

  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Complaint Category Stats</Text>
        {categoryData.map((cat) => (
          <View style={styles.catRow} key={cat.label}>
            <Text style={styles.catLabel}>{cat.label}:</Text>
            <Text style={[styles.catCount, { color: cat.color }]}>{cat.count}</Text>
          </View>
        ))}
        <Text style={[styles.subtitle, {marginTop:20}]}>Complaints by Status</Text>
        <View style={styles.barGraph}>
          {barData.map((bar) => (
            <View style={styles.barRow} key={bar.label}>
              <Text style={styles.barLabel}>{bar.label}</Text>
              <View style={styles.barOuter}>
                <View style={[styles.barInner, { width: `${(bar.count / maxBar) * 100}%`, backgroundColor: bar.color }]} />
              </View>
              <Text style={styles.barCount}>{bar.count}</Text>
            </View>
          ))}
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 24, alignItems: "center", width: "100%" },
  title: { fontSize: 26, fontWeight: "800", color: "#11493f", marginBottom: 10 },
  subtitle: { color: "#11493f", marginBottom: 16, fontWeight: "700", fontSize: 16 },
  catRow: { flexDirection: "row", justifyContent: "space-between", width: "70%", marginBottom: 4 },
  catLabel: { color: "#197278", fontWeight: "600", fontSize: 15 },
  catCount: { fontWeight: "800", fontSize: 15 },
  barGraph: { width: "90%", marginTop: 10, alignSelf: "center" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  barLabel: { width: 110, color: "#11493f", fontWeight: "600" },
  barOuter: { flex: 1, height: 22, backgroundColor: "#f3ead3", borderRadius: 8, marginRight: 8, overflow: "hidden" },
  barInner: { height: "100%", borderRadius: 8 },
  barCount: { width: 36, textAlign: "right", fontWeight: "700", color: "#197278" },
});