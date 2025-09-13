import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Layout from "../../components/Layout";

export default function AboutScreen({ navigation }) {
  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>About / FAQs</Text>
        <Text style={styles.subtitle}>
          The Citizen Complaint Portal is a platform for community members to submit, track, and resolve local issues efficiently and transparently. Our goal is to create a better community by empowering citizens to voice their concerns, and enabling local authorities to address them quickly.
        </Text>
      </View>
      <View style={styles.faqList}>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Q: What is the Citizen Complaint Portal?</Text>
          <Text style={styles.faqA}>A: An online platform for reporting and tracking complaints in your community.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Q: How do I submit a complaint?</Text>
          <Text style={styles.faqA}>A: Go to "Submit Complaint", fill out the form and click "Submit Complaint".</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Q: Can I remain anonymous?</Text>
          <Text style={styles.faqA}>A: Yes, you can submit a complaint without entering your name.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Q: How can I track my complaint?</Text>
          <Text style={styles.faqA}>A: Use the "Track Your Complaint" field on the Home page or the "Track Complaint" screen.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Q: How will I know when my complaint is resolved?</Text>
          <Text style={styles.faqA}>A: Track your complaint ID to see real-time status updates.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Q: Can I submit complaints about any issue?</Text>
          <Text style={styles.faqA}>A: Yes, you can select from suggested categories or add a new one.</Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fbf3df", padding: 22, borderRadius: 12, marginBottom: 18 },
  title: { fontSize: 28, textAlign: "center", fontWeight: "800", color: "#11493f" },
  subtitle: { marginTop: 8, textAlign: "center", color: "#11493f" },
  faqList: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ece6d5",
  },
  faqItem: { marginBottom: 18 },
  faqQ: { color: "#11493f", fontWeight: "700", marginBottom: 4 },
  faqA: { color: "#197278", marginLeft: 8 },
});