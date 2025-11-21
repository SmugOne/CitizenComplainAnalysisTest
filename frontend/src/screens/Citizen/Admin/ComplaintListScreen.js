import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";

// Column widths for active complaints
const COLUMN_WIDTHS = {
  ID: 60,
  Name: 120,
  Complaint: 320,
  Category: 120,
  Status: 120,
  Location: 150,
  Action: 100,
};

// Filter options
const CATEGORY_OPTIONS = [
  "All", "DPWH", "DOH", "DENR", "OMBUDSMAN",
  "LTO", "MMDA", "PNP", "DEPED", "BFP", "DOTR", "DITC"
];

const STATUS_OPTIONS_ACTIVE = ["All", "UNSOLVED", "UNDER REVIEW"];
const STATUS_OPTIONS_ARCHIVE = ["All", "SOLVED", "SPAM"];

export default function ComplaintListScreen({ navigation }) {
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [archivedComplaints, setArchivedComplaints] = useState([]);
  const [viewMode, setViewMode] = useState("Active"); // "Active" or "Archive"
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilterActive, setStatusFilterActive] = useState("All");
  const [statusFilterArchive, setStatusFilterArchive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  //Resolver screen states
  const [screen, setScreen] = useState("table");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("UNSOLVED");
  const [newAgency, setNewAgency] = useState("");
  const [remark, setRemark] = useState("");

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, archiveRes] = await Promise.all([
          fetch(`${API_URL}/api/complaints`),
          fetch(`${API_URL}/api/archive_complaints`)
        ]);
        const [activeData, archiveData] = await Promise.all([activeRes.json(), archiveRes.json()]);
        setActiveComplaints(activeData);
        setArchivedComplaints(archiveData);
        setLoading(false);
      } catch {
        setFetchError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openResolver = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.Status || "UNSOLVED");
    setNewAgency(complaint["Predicted Agency"] || complaint["Category"] || "");
    setRemark(
      complaint.Status?.toUpperCase() === "UNDER REVIEW" && complaint.Remark
        ? complaint.Remark
        : ""
    );
    setScreen("resolve");
  };

  const submitResolution = () => {
    fetch(`${API_URL}/api/complaints/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedComplaint.ID,
        status: newStatus,
        agency: newAgency,
        remark: remark,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Complaint updated.");
        setScreen("table");
      })
      .catch(() => alert("Error updating complaint"));
  };

  // Filter helpers
  const filterComplaints = (data, category, status) => {
    return data.filter(c => {
      const cat = (c["Predicted Agency"] || c["Category"] || "").toUpperCase();
      const stat = (c.Status || "").toUpperCase();
      const categoryMatch = category === "All" || cat === category.toUpperCase();
      const statusMatch = status === "All" || stat === status.toUpperCase();
      return categoryMatch && statusMatch;
    });
  };

  const currentComplaints = viewMode === "Active"
    ? filterComplaints(activeComplaints, categoryFilter, statusFilterActive)
    : filterComplaints(archivedComplaints, categoryFilter, statusFilterArchive);

  const currentStatusOptions = viewMode === "Active" ? STATUS_OPTIONS_ACTIVE : STATUS_OPTIONS_ARCHIVE;
  //Main resolver screen:
    if (screen === "resolve" && selectedComplaint) {
      return (
        <Layout navigation={navigation}>
          <View style={styles.resolveContainer}>

            <Text style={styles.resolveTitle}>
              Resolve Complaint #{selectedComplaint.ID}
            </Text>

            {/* DETAILS */}
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

            {/* ACTIONS */}
            <View style={styles.actionBox}>

              <Text style={styles.resolveLabel}>Change and update status</Text>
              <Picker
                selectedValue={newStatus}
                onValueChange={setNewStatus}
                style={styles.resolvePicker}
              >
                <Picker.Item label="UNSOLVED" value="UNSOLVED" />
                <Picker.Item label="SOLVED" value="SOLVED" />
                <Picker.Item label="SPAM" value="SPAM" />
              </Picker>

              <Text style={styles.resolveLabel}>Change and update agency</Text>
              <Picker
                selectedValue={newAgency}
                onValueChange={setNewAgency}
                style={styles.resolvePicker}
              >
                {CATEGORY_OPTIONS.map(a => (
                  <Picker.Item key={a} label={a} value={a} />
                ))}
              </Picker>

              <Text style={styles.resolveLabel}>Remarks</Text>
              <TextInput
                style={styles.resolveInput}
                multiline
                value={remark}
                onChangeText={setRemark}
              />

              <View style={styles.resolveButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setScreen("table")}
                >
                  <Text>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.updateBtn}
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

            {/* Details */}
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

            {/* Pickers */}
            <View style={styles.actionBox}>
              <Text style={styles.resolveLabel}>Change and update status</Text>
              <Picker
                selectedValue={newStatus}
                onValueChange={setNewStatus}
                style={styles.resolvePicker}
              >
                <Picker.Item label="UNSOLVED" value="UNSOLVED" />
                <Picker.Item label="SOLVED" value="SOLVED" />
                <Picker.Item label="SPAM" value="SPAM" />
              </Picker>

              <Text style={styles.resolveLabel}>Change and update agency</Text>
              <Picker
                selectedValue={newAgency}
                onValueChange={setNewAgency}
                style={styles.resolvePicker}
              >
                {CATEGORY_OPTIONS.map((a) => (
                  <Picker.Item key={a} label={a} value={a} />
                ))}
              </Picker>

              <Text style={styles.resolveLabel}>Remarks</Text>
              <TextInput
                style={styles.resolveInput}
                multiline
                value={remark}
                onChangeText={setRemark}
              />

              <View style={styles.resolveButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setScreen("table")}
                >
                  <Text>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.updateBtn}
                  disabled={!remark.trim()}
                  onPress={submitResolution}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Layout>
      );
    }
    
    return (
    <Layout navigation={navigation}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.title}>
          {viewMode === "Active" ? "Active Complaints" : "Archived Complaints"}
        </Text>

        {/* Filters */}
        <View style={styles.filterRow}>
          <Picker
            selectedValue={viewMode}
            style={styles.picker}
            onValueChange={setViewMode}
          >
            <Picker.Item label="Active Complaints" value="Active" />
            <Picker.Item label="Archived Complaints" value="Archive" />
          </Picker>

          <Picker
            selectedValue={categoryFilter}
            style={styles.picker}
            onValueChange={setCategoryFilter}
          >
            {CATEGORY_OPTIONS.map(opt => <Picker.Item label={opt} value={opt} key={opt} />)}
          </Picker>

          <Picker
            selectedValue={viewMode === "Active" ? statusFilterActive : statusFilterArchive}
            style={styles.picker}
            onValueChange={val => viewMode === "Active" ? setStatusFilterActive(val) : setStatusFilterArchive(val)}
          >
            {currentStatusOptions.map(opt => <Picker.Item label={opt} value={opt} key={opt} />)}
          </Picker>
        </View>

        {/* Table */}
        <ScrollView style={{ maxHeight: 400 }}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              {viewMode === "Active" ? (
                <>
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.ID }]}>ID</Text>
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Name }]}>Name</Text>
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Complaint }]}>Complaint</Text>
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Category }]}>Category</Text>
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Status }]}>Status</Text>
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Location }]}>Location</Text>
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Action }]}>Action</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.headerCell, { width: 60 }]}>ID</Text>
                  <Text style={[styles.headerCell, { width: 120 }]}>Name</Text>
                  <Text style={[styles.headerCell, { width: 320 }]}>Complaint</Text>
                  <Text style={[styles.headerCell, { width: 150 }]}>Location</Text>
                  <Text style={[styles.headerCell, { width: 120 }]}>Agency</Text>
                  <Text style={[styles.headerCell, { width: 120 }]}>Image ID</Text>
                  <Text style={[styles.headerCell, { width: 100 }]}>Status</Text>
                  <Text style={[styles.headerCell, { width: 150 }]}>Remark</Text>
                  <Text style={[styles.headerCell, { width: 150 }]}>Feedback</Text>
                </>
              )}
            </View>

            {loading ? (
              <Text style={{ margin: 10, color: "#11493f" }}>Loading...</Text>
            ) : fetchError ? (
              <Text style={{ margin: 10, color: "red" }}>Error loading data.</Text>
            ) : currentComplaints.length === 0 ? (
              <Text style={{ margin: 10, color: "#11493f" }}>No {viewMode.toLowerCase()} complaints found.</Text>
            ) : (
              currentComplaints.map(c => (
                <View style={styles.tableRow} key={c.ID || c.id}>
                  {viewMode === "Active" ? (
                    <>
                      <Text style={[styles.cell, { width: COLUMN_WIDTHS.ID }]}>{c.ID || c.id}</Text>
                      <Text style={[styles.cell, { width: COLUMN_WIDTHS.Name }]}>{c.Name}</Text>
                      <Text style={[styles.cell, { width: COLUMN_WIDTHS.Complaint, textAlign: "left" }]}>{c.Complaint || c["Raw Complaint"]}</Text>
                      <Text style={[styles.cell, { width: COLUMN_WIDTHS.Category }]}>{c["Predicted Agency"] || c["Category"]}</Text>
                      <Text style={[styles.cell, { width: COLUMN_WIDTHS.Status }]}>{c.Status}</Text>
                      <Text style={[styles.cell, { width: COLUMN_WIDTHS.Location }]}>{c.Location}</Text>
                      <TouchableOpacity
                        style={[styles.actionBtn, { width: COLUMN_WIDTHS.Action }]}
                        onPress={() => openResolver(c)}
                      >
                        <Text style={styles.actionBtnText}>Resolve</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.cell, { width: 60 }]}>{c.ID || c.id}</Text>
                      <Text style={[styles.cell, { width: 120 }]}>{c.Name}</Text>
                      <Text style={[styles.cell, { width: 320, textAlign: "left" }]}>{c.Complaint || c["Raw Complaint"]}</Text>
                      <Text style={[styles.cell, { width: 150 }]}>{c.Location}</Text>
                      <Text style={[styles.cell, { width: 120 }]}>{c.Agency || c["Predicted Agency"] || c["Category"]}</Text>
                      <Text style={[styles.cell, { width: 120 }]}>{c["Image ID"]}</Text>
                      <Text style={[styles.cell, { width: 100 }]}>{c.Status}</Text>
                      <Text style={[styles.cell, { width: 150 }]}>{c.Remark || ""}</Text>
                      <Text style={[styles.cell, { width: 150 }]}>{c.Feedback || ""}</Text>
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </Layout>
    );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", color: "#11493f", marginBottom: 12, textAlign: "center" },
  filterRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, gap: 12 },
  picker: { flex: 1, backgroundColor: "#e6f0ff", borderRadius: 8, height: 50 },
  tableContainer: { minWidth: 850, alignSelf: "center", backgroundColor: "#f9fbfd", borderRadius: 12, overflow: "hidden", marginBottom: 12 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderColor: "#197278", paddingVertical: 10, backgroundColor: "#e6f0ff" },
  headerCell: { fontWeight: "bold", color: "#11493f", textAlign: "center", fontSize: 16 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ececec", paddingVertical: 12, backgroundColor: "#fff" },
  cell: { textAlign: "center", color: "#222", fontSize: 15, paddingHorizontal: 4 },
  actionBtn: { backgroundColor: "#197278", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "700" },
});
