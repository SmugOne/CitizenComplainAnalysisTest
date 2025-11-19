import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Layout from "../../components/Layout";
import { API_URL } from "@env";

export default function TrackComplaintScreen({ route, navigation }) {
  const [inputId, setInputId] = useState(route?.params?.complaintId || "");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordStep, setIsPasswordStep] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleFeedback = async () => {
    if (!feedbackText.trim()) {
      alert("Please enter feedback.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/complaints/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID: complaint.ID,
          Feedback: feedbackText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Feedback submitted!");
        setFeedbackMode(false);
        setFeedbackText("");
      } else {
        // Show backend-provided message, e.g., "Feedback already submitted"
        alert(data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      alert("Server error while sending feedback.");
    }
  };

  const handleTrack = async () => {
    if (!inputId.trim()) {
      setComplaint(null);
      setError("Please enter a Complaint ID.");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);
    setIsPasswordStep(false);
    setIsVerified(false);

    try {
      const response = await fetch(`${API_URL}/api/complaints/track/${inputId.trim()}`);
      const data = await response.json();

      if (data.found) {
        setComplaint(data.complaint);
        setIsPasswordStep(true); //prompt password
        setError("");
      } else {
        setError(data.message || "No complaint found with that ID.");
      }
    } catch (err) {
      console.error("Error fetching complaint:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordCheck = () => {
    if (passwordInput.trim() === complaint.Password) {
      setIsVerified(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const renderStatus = (status) => {
    if (status === "UNSOLVED") return "Unsolved";
    if (status === "UNDER REVIEW") return "Under Review";
    if (status === "SOLVED") return "Solved";
    if (status === "SPAM") return "Marked as Spam";
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
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.trackBtnText}>Track</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {error ? (
          <View style={styles.resultCard}>
            <Text style={[styles.statusText, { color: "red" }]}>{error}</Text>
          </View>
        ) : null}

        {/* Password step */}
        {isPasswordStep && !isVerified && (
          <View style={styles.resultCard}>
            <Text style={styles.statusText}>
              Enter the password for Complaint ID {complaint.ID}:
            </Text>
            <TextInput
              style={[styles.input, { marginTop: 10, width: "100%" }]}
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="Enter Password"
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.trackBtn, { marginTop: 10 }]}
              onPress={handlePasswordCheck}
            >
              <Text style={styles.trackBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Verified complaint details */}
        {isVerified && complaint && (
          <View style={styles.resultCard}>
            <Text style={styles.statusTitle}>Complaint ID: {complaint.ID}</Text>
            <Text style={styles.complaintText}>{complaint.Complaint}</Text>
            <Text style={styles.statusText}>
              Marked Status: {renderStatus(complaint.Status)}
            </Text>

            {complaint.Remarks ? (
              <Text style={styles.remarksText}>Remarks: {complaint.Remarks}</Text>
            ) : null}

            {/* Send Feedback Button only for SOLVED or SPAM */}
            {(complaint.Status === "SOLVED" || complaint.Status === "SPAM") && !feedbackMode && (
              <TouchableOpacity
                style={styles.feedbackBtn}
                onPress={() => setFeedbackMode(true)}
              >
                <Text style={styles.feedbackBtnText}>Send Feedback</Text>
              </TouchableOpacity>
            )}

            {/* FEEDBACK INPUT BOX */}
            {feedbackMode && (
              <View style={{ width: "100%", marginTop: 15 }}>
                <Text style={styles.statusText}>Write your feedback:</Text>

                <TextInput
                  style={[
                    styles.input,
                    { width: "100%", marginTop: 10, backgroundColor: "#f3ead3" }
                  ]}
                  multiline
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  placeholder="Enter your feedback..."
                />

                <TouchableOpacity
                  style={[styles.feedbackBtn, { marginTop: 10 }]}
                  onPress={handleFeedback}
                >
                  <Text style={styles.feedbackBtnText}>Submit Feedback</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
           )}
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
    backgroundColor: "#ffffffff",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  statusTitle: {color: "#197278", fontWeight: "700", fontSize: 18, marginBottom: 6,},
  complaintText: {color: "#11493f", fontSize: 16, textAlign: "center", marginBottom: 8,},
  statusText: { color: "#11493f", fontWeight: "700", fontSize: 18, marginTop: 20 },
  agencyText: { color: "#197278", fontStyle: "italic", marginTop: 5 },
  remarksText: { color: "#11493f", fontWeight: "700", fontSize: 18 },

  feedbackBtn: {marginTop: 15, backgroundColor: "#197278", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,},
  feedbackBtnText: {color: "#fff", fontWeight: "bold", textAlign: "center",},
});