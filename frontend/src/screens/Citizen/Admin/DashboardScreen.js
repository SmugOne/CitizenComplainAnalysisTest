import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";
import { Modal, TextInput, Button, TouchableOpacity } from "react-native";

//For filters
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

//For agency assignment in resolve screen
const AGENCY_OPTIONS = [
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

//Table column widths
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
  //For action button:
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("UNSOLVED");
  const [newAgency, setNewAgency] = useState("");
  const [remark, setRemark] = useState("");
  //Switch from table to resolve screen
  const [screen, setScreen] = useState("table");
  const [resolveTab, setResolveTab] = useState("details"); 
  //For table and filter states:
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

  const openResolver = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.Status || "UNSOLVED");
    setNewAgency(complaint["Predicted Agency"] || complaint["Category"] || "");
    setRemark(""); 
    setScreen("resolve");
  };

  //Only show UNSOLVED complaints
  const filteredComplaints = complaints.filter(row => {
    const cat = (row["Predicted Agency"] || row["Category"] || "").toUpperCase();
    const stat = (row["Status"] || "").toUpperCase();
    const categoryMatch = category === "All" || cat === category.toUpperCase();
    const resolvable = stat === "UNSOLVED" || stat === "UNDER REVIEW";;
    return categoryMatch && resolvable;
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

  //Submit resolution changes
  const submitResolution = () => {
    fetch(`${API_URL}/api/complaints/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedComplaint.ID,
        status: newStatus,
        agency: newAgency,
        remark: remark,
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Complaint updated.");
        setModalVisible(false);
        //Refresh after update
        navigation.goBack();
      })
      .catch(err => alert("Error saving changes."));
  };

//Main resolver screen:
  if (screen === "resolve" && selectedComplaint) {
    return (
      <Layout navigation={navigation}>
        <View style={styles.resolveContainer}>
          <Text style={styles.resolveTitle}>
            Resolve Complaint #{selectedComplaint.ID}
          </Text>

          {/* Complaint Details */}
          {resolveTab === "details" && (
          <View style={styles.detailsBox}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{selectedComplaint.Name}</Text>

            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{selectedComplaint.Location}</Text>

            <Text style={styles.detailLabel}>Complaint:</Text>
            <Text style={styles.detailValue}>{selectedComplaint.Complaint}</Text>

            <Text style={styles.detailLabel}>Image ID:</Text>
            <Text style={styles.detailValue}>
              {selectedComplaint.ImageID || "None"}
            </Text>
          </View>
        )}

          {/* Status Picker */}
          <View style={styles.actionBox}>
          <Text style={styles.resolveLabel}>Change and update status</Text>
          <Picker
            selectedValue={newStatus}
            onValueChange={setNewStatus}
            style={styles.resolvePicker}
          >
            <Picker.Item label="UNSOLVED" value="UNSOLVED" />
            <Picker.Item label="UNDER REVIEW" value="UNDER REVIEW" />
            <Picker.Item label="SOLVED" value="SOLVED" />
            <Picker.Item label="SPAM" value="SPAM" />
          </Picker>

          {/* Agency Picker */}
          <Text style={styles.resolveLabel}>Change and update agency</Text>
          <Picker
            selectedValue={newAgency}
            onValueChange={setNewAgency}
            style={styles.resolvePicker}
          >
            {AGENCY_OPTIONS.map(a => (
              <Picker.Item label={a} value={a} key={a} />
            ))}
          </Picker>

          {/* Remarks */}
          <Text style={styles.resolveLabel}>Remarks</Text>
          <TextInput
            style={styles.resolveInput}
            multiline
            value={remark}
            onChangeText={setRemark}
            placeholder="Write remarks..."
          />

          {/* Buttons */}
          <View style={styles.resolveButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setScreen("table")}
            >
              <Text>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.updateBtn,
                { opacity: remark.trim() ? 1 : 0.5 }
              ]}
              disabled={!remark.trim()}
              onPress={submitResolution}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Update
              </Text>
            </TouchableOpacity>
           </View>
          </View>
        </View>
      </Layout>
    );
  }

//Main dashboard table screen
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
                          onPress={() => openResolver(row)}
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
    backgroundColor: "#DC2626", 
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
  },
  resolveContainer: {
  flex: 1,
  padding: 20,
  },
  resolveTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#11493f",
    marginBottom: 20,
  },
  resolveLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  resolvePicker: {
    backgroundColor: "#e6f0ff",
    borderRadius: 10,
    marginBottom: 12,
    height: 50
  },
  resolveInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    height: 120,
    marginTop: 6,
    textAlignVertical: "top",
  },
  resolveButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center"
  },
  updateBtn: {
    backgroundColor: "#197278",
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center"
  },
  tabHeader: {
  flexDirection: "row",
  marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ddd",
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#4a90e2",
  },
  tabText: {
    color: "#000",
    fontWeight: "bold",
  },
  detailsBox: {
    backgroundColor: "#f7f7f7",
    padding: 15,
    borderRadius: 10,
  },
  detailLabel: {
    fontWeight: "bold",
    marginTop: 8,
  },
  detailValue: {
    marginLeft: 10,
    marginBottom: 4,
  },
  actionBox: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});