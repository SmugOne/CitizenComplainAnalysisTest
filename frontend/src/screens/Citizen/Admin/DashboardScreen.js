import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";
import { Modal, TextInput, Button, TouchableOpacity } from "react-native";

const CATEGORY_OPTIONS = [
  "All",
  "DPWH",
  "DOH",
  "DENR",
  "OMBUDSMAN",
  "LTO",
  "MMDA",
  "PNP",
  "DEPED",
  "BFP",
  "DOTR",
];

//For table
const COLUMN_WIDTHS = {
  ID: 60,
  Name: 120,
  Complaint: 320,
  Category: 120,
  Status: 100,
  Location: 150,
  ImageID: 100,
  Action: 100,
};

export default function DashboardScreen({ navigation }) {
  //For action button
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("UNSOLVED");
  const [newAgency, setNewAgency] = useState("All");
  const [remark, setRemark] = useState("");
  //For table and filter states
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/complaints`)
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.Status || "UNSOLVED");
    setNewAgency(complaint["Predicted Agency"] || complaint["Category"] || "All");
    setRemark(""); // start empty
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!remark.trim()) {
      alert("Please add a remark before submitting.");
      return;
    }

    fetch(`${API_URL}/api/complaints/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedComplaint.ID,
        status: newStatus,
        agency: newAgency,
        remark,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Complaint updated successfully!");
          setModalVisible(false);

          //Refresh frontend state
          setComplaints(prev =>
            prev.map(c =>
              c.ID === selectedComplaint.ID
                ? { ...c, Status: newStatus, "Predicted Agency": newAgency }
                : c
            )
          );
        } else {
          alert("Failed to update complaint.");
        }
      })
      .catch(() => alert("Failed to update complaint."));
  };

  const filteredComplaints = complaints.filter(row => {
    const cat = (row["Predicted Agency"] || row["Category"] || "").toUpperCase();
    const stat = (row["Status"] || "").toUpperCase();
    const categoryMatch = category === "All" || cat === category.toUpperCase();
    const onlyUnsolved = stat === "UNSOLVED";
    return categoryMatch && onlyUnsolved;
  });

  const flaggedCount = filteredComplaints.filter(
    row => row["Flagged Words"] === true || row["Flagged Words"] === "True"
  ).length;

  const avgSeverity = filteredComplaints.length
    ? (
        filteredComplaints.reduce(
          (sum, row) =>
            sum +
            (parseFloat(row["Anger Score"]) || 0) +
            (parseFloat(row["Fear Score"]) || 0) +
            (parseFloat(row["Sadness Score"]) || 0),
          0
        ) /
        (filteredComplaints.length * 3)
      ).toFixed(2)
    : "0.00";

  const submitResolution = () => {
    fetch(`${API_URL}/api/admin/updateComplaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ID: selectedComplaint.ID,
        status: newStatus,
        agency: newAgency,
        remarks: remark
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Complaint updated.");
        setModalVisible(false);
        //Refresh after update
        navigation.replace("DashboardScreen");
      })
      .catch(err => alert("Error saving changes."));
  };

  return (
    <Layout navigation={navigation}>
      <View style={{ flex: 1, paddingBottom: 80 }}>
        <Text style={styles.title}>Emotionally Urgent Complaints</Text>

        
        {/* Filters */}
        <View style={styles.filtersRow}>
          <View style={styles.filter}>
            <Text style={styles.label}>Complaint Category</Text>
            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={setCategory}>
              {CATEGORY_OPTIONS.map(opt => (
                <Picker.Item label={opt} value={opt} key={opt} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Widgets */}
        <View style={styles.widgetsRow}>
          <View style={[styles.widget, { backgroundColor: "#eaf3fc" }]}>
            <Text style={[styles.widgetTitle, { color: "#11493f" }]}>Total Complaints</Text>
            <Text style={styles.widgetValue}>{filteredComplaints.length}</Text>
          </View>
          <View style={[styles.widget, { backgroundColor: "#fbeaec" }]}>
            <Text style={[styles.widgetTitle, { color: "#c00" }]}>Flagged Urgent Complaints</Text>
            <Text style={[styles.widgetValue, { color: "#c00" }]}>{flaggedCount}</Text>
          </View>
          <View style={[styles.widget, { backgroundColor: "#eafbe5" }]}>
            <Text style={[styles.widgetTitle, { color: "#197278" }]}>Avg. Severity Score</Text>
            <Text style={styles.widgetValue}>{avgSeverity}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={{ flex: 1, marginTop: 20, alignItems: "center" }}>
          <ScrollView contentContainerStyle={{ justifyContent: "center" }}>
            <View style={styles.tableContainer}>
              {/* Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.ID }]}>ID</Text>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Name }]}>Name</Text>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Complaint }]}>Complaint</Text>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Category }]}>Category</Text>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Status }]}>Status</Text>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Location }]}>Location</Text>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.ImageID }]}>Image ID</Text>
                <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Action }]}>Action</Text>
              </View>

              {/* Body */}
              <ScrollView style={{ maxHeight: 300 }}>
                {loading ? (
                  <Text style={{ margin: 10, color: "#11493f" }}>Loading...</Text>
                ) : fetchError ? (
                  <Text style={{ color: "red", margin: 10 }}>Error loading data.</Text>
                ) : filteredComplaints.length === 0 ? (
                  <Text style={{ margin: 10, color: "#11493f" }}>
                    No complaints found for the selected filters.
                  </Text>
                ) : (
                  filteredComplaints.map((row) => {
                    const isFlagged =
                      row["Flagged Words"] === true || row["Flagged Words"] === "True";
                    return (
                      <View
                        style={[styles.tableRow, isFlagged && styles.flaggedRow]}
                        key={row.ID}>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.ID }]}>
                          {isFlagged ? "🚩 " : ""}
                          {row.ID}
                        </Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Name }]}>{row.Name}</Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Complaint, textAlign: "left" }]}>
                          {row.Complaint}
                        </Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Category }]}>
                          {row["Predicted Agency"] || row["Category"]}
                        </Text>
                        <Text
                          style={[
                            styles.cell,
                            { width: COLUMN_WIDTHS.Status, fontWeight: "bold", color: isFlagged ? "#DC2626" : "#197278" },
                          ]}>
                          {row.Status}
                        </Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Location }]}>{row.Location}</Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.ImageID }]}>{row["Image ID"]}</Text>
                        <TouchableOpacity
                          style={[styles.resolveBtn, { width: COLUMN_WIDTHS.Action }]}
                          onPress={() => openModal(row)}
                        >
                          <Text style={{ color: "#fff", fontWeight: "bold" }}>Resolve</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
        {modalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Resolve Complaint #{selectedComplaint.ID}</Text>

              <Text style={styles.modalLabel}>Status</Text>
              <Picker selectedValue={newStatus} onValueChange={setNewStatus}>
                <Picker.Item label="UNSOLVED" value="UNSOLVED" />
                <Picker.Item label="SOLVED" value="SOLVED" />
                <Picker.Item label="SPAM" value="SPAM" />
              </Picker>

              <Text style={styles.modalLabel}>Agency</Text>
              <TextInput
                style={styles.modalInput}
                value={newAgency}
                onChangeText={setNewAgency}
              />

              <Text style={styles.modalLabel}>Remarks</Text>
              <TextInput
                style={styles.modalInput}
                value={remark}
                onChangeText={setRemark}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={submitResolution}
                >
                  <Text style={{ color: "#fff" }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#11493f",
    marginBottom: 16,
    textAlign: "center",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
    gap: 36
  },
  filter: {
    flex: 1,
    minWidth: 260,
    marginHorizontal: 16
  },
  label: {
    fontWeight: "700",
    fontSize: 18,
    color: "#11493f",
    marginBottom: 8,
    fontFamily: "sans-serif"
  },
  picker: {
    backgroundColor: "#e6f0ff",
    borderRadius: 10,
    height: 52,
    marginBottom: 8,
    fontSize: 17,
    fontFamily: "sans-serif"
  },
  widgetsRow: {
    flexDirection: "row",
    gap: 28,
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
    justifyContent: "center"
  },
  widget: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: "center",
    minWidth: 220,
    maxWidth: 340,
    flex: 1,
    marginHorizontal: 8
  },
  resolveBtn: {
    backgroundColor: "#DC2626", // red color
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignSelf: "center",
  },
  widgetTitle: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center"
  },
  widgetValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#11493f"
  },
  tableContainer: {
    minWidth: 950,
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: "#f9fbfd",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 3,
    borderColor: "#197278",
    paddingVertical: 10,
    backgroundColor: "#e6f0ff"
  },
  headerCell: {
    width: 90,
    fontWeight: "bold",
    color: "#11493f",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "sans-serif"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ececec",
    paddingVertical: 12,
    backgroundColor: "#fff"
  },
  cell: {
    width: 130,
    textAlign: "center",
    color: "#222",
    fontSize: 16,
    fontFamily: "sans-serif"
  },
  flaggedRow: {
    backgroundColor: "#ffeaea"
  }
});