import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Layout from "../../components/Layout";

export default function HomeScreen({ navigation }) {
  return (
    <Layout navigation={navigation}>
      {/* Top: Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome to Citizen Complaint Analysis System</Text>
      </View>
      {/* Middle section */}
      <View style={styles.middleSection}>
        {/* Left: How it Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {/* You can use SVGs or images here for real infographics, here's text for now */}
          <View style={styles.infographicStep}>
            <View style={styles.circle}>1</View>
            <Text style={styles.infoText}>Submit your complaint</Text>
          </View>
          <View style={styles.infographicStep}>
            <View style={styles.circle}>2</View>
            <Text style={styles.infoText}>We analyze and assign your case</Text>
          </View>
          <View style={styles.infographicStep}>
            <View style={styles.circle}>3</View>
            <Text style={styles.infoText}>You track progress & status online</Text>
          </View>
          <View style={styles.infographicStep}>
            <View style={styles.circle}>4</View>
            <Text style={styles.infoText}>Issue resolved, feedback welcomed!</Text>
          </View>
        </View>
        {/* Right: News/Announcements */}
        <View style={styles.announcements}>
          <Text style={styles.sectionTitle}>News / Announcements</Text>
          <View style={styles.announceCard}>
            <Text style={styles.announceTitle}>🚧 Infrastructure upgrades in progress!</Text>
            <Text style={styles.announceBody}>Expect minor roadwork delays in Barangay Center until 09/30/2025.</Text>
          </View>
          <View style={styles.announceCard}>
            <Text style={styles.announceTitle}>🗑️ New Waste Collection Schedule</Text>
            <Text style={styles.announceBody}>Garbage collection now every Monday and Thursday, 7AM-10AM.</Text>
          </View>
          <View style={styles.announceCard}>
            <Text style={styles.announceTitle}>🔒 Safety Campaign Launched</Text>
            <Text style={styles.announceBody}>Our new “Safe Community” campaign empowers you to report safety issues easily.</Text>
          </View>
        </View>
      </View>
      {/* Lower: Benefits/Transparency */}
      <View style={styles.lowerSection}>
        <Text style={styles.sectionTitle}>Benefits & Transparency</Text>
        <View style={styles.benefitsRow}>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Faster Response</Text>
          </View>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>👁️</Text>
            <Text style={styles.benefitText}>Transparent Tracking</Text>
          </View>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>🧑‍🤝‍🧑</Text>
            <Text style={styles.benefitText}>Community Empowerment</Text>
          </View>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>📈</Text>
            <Text style={styles.benefitText}>Open Stats</Text>
          </View>
        </View>
        <Text style={styles.statsText}>Complaints resolved: <Text style={{fontWeight: "bold"}}>0</Text> | Total complaints: <Text style={{fontWeight: "bold"}}>0</Text></Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#11493f",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 18,
  },
  bannerTitle: { color: "#ffd66b", fontWeight: "800", fontSize: 32, textAlign: "center" },
  middleSection: {
    flexDirection: "row",
    marginBottom: 22,
    gap: 32,
    minHeight: 260,
  },
  howItWorks: { flex: 1, backgroundColor: "#e8f0ea", borderRadius: 12, padding: 18, marginRight: 12 },
  announcements: { flex: 1, backgroundColor: "#fffbe8", borderRadius: 12, padding: 18 },
  sectionTitle: { fontWeight: "bold", fontSize: 20, marginBottom: 12, color: "#11493f" },
  infographicStep: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffd66b",
    color: "#11493f",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 18,
    lineHeight: 28,
    paddingTop: 1,
  },
  infoText: { fontSize: 15, color: "#11493f" },
  announceCard: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffe8aa",
  },
  announceTitle: { fontWeight: "bold", color: "#11493f", marginBottom: 2 },
  announceBody: { color: "#444" },
  lowerSection: { marginTop: 10, marginBottom: 12 },
  benefitsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8, flexWrap: "wrap" },
  benefitCard: { alignItems: "center", marginHorizontal: 10, marginVertical: 4 },
  benefitIcon: { fontSize: 32, marginBottom: 2 },
  benefitText: { fontWeight: "bold", color: "#197278", fontSize: 15 },
  statsText: { color: "#11493f", textAlign: "center", fontSize: 15, marginTop: 8 },
});