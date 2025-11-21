import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
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
  ImageID: 120,
  Action: 100,
};

//Filter options
const CATEGORY_OPTIONS = [
  "All", "DPWH", "DOH", "DENR", "OMBUDSMAN",
  "LTO", "MMDA", "PNP", "DEPED", "BFP", "DOTR", "DITC"
];

//Filter for active complaints
const STATUS_OPTIONS_ACTIVE = ["All", "UNSOLVED", "UNDER REVIEW"];

//Filter for archived complaints
const STATUS_OPTIONS_ARCHIVE = ["All", "SOLVED", "SPAM"];

//Agencies for resolver screen
const AGENCY_OPTIONS = [
  "DPWH", "DOH", "DENR", "OMBUDSMAN",
  "LTO", "MMDA", "PNP", "DEPED",
  "BFP", "DOTR", "DITC", "NONE"
];


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
  const [resolveTab, setResolveTab] = useState("details");
  //Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const MyModal = ({ visible, message, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"rgba(0,0,0,0.5)" }}>
      <View style={{ backgroundColor:"#fff", padding:20, borderRadius:10, width:"80%" }}>
        <Text style={{ fontSize:18, marginBottom:20 }}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={{ alignSelf:"flex-end" }}>
          <Text style={{ color:"#197278", fontWeight:"bold" }}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

  //Load data
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
      .then(res => res.json())
      .then(() => {
        setModalMessage("Complaint updated.");
        setModalVisible(true);  
      })
      .catch(() => {
        setModalMessage("Error updating complaint.");
        setModalVisible(true);
      });
    };


  //Refetch function
  const refetchComplaints = async () => {
    setLoading(true);
    try {
      const [activeRes, archiveRes] = await Promise.all([
        fetch(`${API_URL}/api/complaints`),
        fetch(`${API_URL}/api/archive_complaints`)
      ]);
      const [activeData, archiveData] = await Promise.all([activeRes.json(), archiveRes.json()]);
      setActiveComplaints(activeData);
      setArchivedComplaints(archiveData);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  //Filter helpers
    const filterComplaints = (data, category, status, viewMode) => {
    return data.filter(c => {
      const agency = (c.Agency || c["Predicted Agency"] || c["Category"] || "").toUpperCase();
      const stat = (c.Status || "").toUpperCase();

      // Status filter logic
      let statusMatch = true;
      if (status && status !== "All") {
        statusMatch = stat === status.toUpperCase();
      } else if (viewMode === "Active") {
        statusMatch = stat === "UNSOLVED" || stat === "UNDER REVIEW";
      }

      const categoryMatch = category === "All" || agency === category.toUpperCase();

      return categoryMatch && statusMatch;
    });
  };

  const currentComplaints = viewMode === "Active"
    ? filterComplaints(activeComplaints, categoryFilter, statusFilterActive, "Active")
    : filterComplaints(archivedComplaints, categoryFilter, statusFilterArchive, "Archive");

  const currentStatusOptions = viewMode === "Active" ? STATUS_OPTIONS_ACTIVE : STATUS_OPTIONS_ARCHIVE;

  const totalFiltered = currentComplaints.length;
  const flaggedCount = currentComplaints.filter(
    row => row["Flagged Words"] === true || row["Flagged Words"] === "True"
  ).length;
  //Main resolver screen:
    if (screen === "resolve" && selectedComplaint) {
      return (
        <Layout navigation={navigation}>
          <View style={styles.resolveContainer}>
            <Text style={styles.resolveTitle}>
              Resolve Complaint #{selectedComplaint.ID}
            </Text>

            {/* Complaint Details */}
            <View style={styles.detailsBox}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{selectedComplaint.Name}</Text>

              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{selectedComplaint.Location}</Text>

              <Text style={styles.detailLabel}>Complaint:</Text>
              <Text style={styles.detailValue}>{selectedComplaint.Complaint || selectedComplaint["Raw Complaint"]}</Text>

              <Text style={styles.detailLabel}>Image ID:</Text>
              <Text style={styles.detailValue}>
                {selectedComplaint.ImageID || "None"}
              </Text>
            </View>

            {/* Status & Agency */}
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
                {AGENCY_OPTIONS.map(a => (
                  <Picker.Item label={a} value={a} key={a} />
                ))}
              </Picker>

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
                  <Text style={{ fontWeight: "bold" }}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.updateBtn, { opacity: remark.trim() ? 1 : 0.5 }]}
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

    //Main Table Screen
    return (
    <Layout navigation={navigation}>
      <View style={{ flex: 1, padding: 20, }}>
        <Text style={styles.title}>
          {viewMode === "Active" ? "Active Complaints" : "Archived Complaints"}
        </Text>

        {/* Modal */}
        <MyModal
          visible={modalVisible}
          message={modalMessage}
          onClose={() => {
            setModalVisible(false);   // close modal
            if (modalMessage === "Complaint updated.") {
              refetchComplaints();    // refresh table only if update succeeded
              setScreen("table");     // return to table view
            }
          }}
        />

        {/* Widgets */}
        <View style={styles.widgetsRow}>
          <View style={[styles.widget, { backgroundColor: "#eaf3fc" }]}>
            <Text style={[styles.widgetTitle, { color: "#11493f" }]}>Total Complaints</Text>
            <Text style={styles.widgetValue}>{totalFiltered}</Text>
          </View>
          <View style={[styles.widget, { backgroundColor: "#fbeaec" }]}>
            <Text style={[styles.widgetTitle, { color: "#c00" }]}>Flagged Urgent Complaints</Text>
            <Text style={[styles.widgetValue, { color: "#c00" }]}>{flaggedCount}</Text>
          </View>
        </View>

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
                  <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.ImageID }]}>Image ID</Text>
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
              currentComplaints.map((c) => {
                const isFlagged =
                  c["Flagged Words"] === true || c["Flagged Words"] === "True";

                return (
                  <View
                    style={[styles.tableRow, isFlagged && styles.flaggedRow]}
                    key={c.ID}
                  >
                    {viewMode === "Active" ? (
                      <>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.ID }]}>
                          {isFlagged ? "🚩 " : ""}
                          {c.ID}
                        </Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Name }]}>{c.Name}</Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Complaint, textAlign: "left" }]}>
                          {c.Complaint || c["Raw Complaint"]}
                        </Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Category }]}>
                          {c["Predicted Agency"] || c["Category"]}
                        </Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Status }]}>{c.Status}</Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.Location }]}>{c.Location}</Text>
                        <Text style={[styles.cell, { width: COLUMN_WIDTHS.ImageID }]}>{c.ImageID}</Text>
                        <TouchableOpacity
                          style={[styles.actionBtn, { width: COLUMN_WIDTHS.Action }]}
                          onPress={() => openResolver(c)}
                        >
                          <Text style={styles.actionBtnText}>Resolve</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.cell, { width: 60 }]}>{isFlagged ? "🚩 " : ""}{c.ID}</Text>
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
                );
              })
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
  actionBtn: { backgroundColor: "#DC2626", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: "center" },
  actionBtnText: { color: "#fff", fontWeight: "bold" },
  detailsBox: { backgroundColor: "#f7f7f7", padding: 15, borderRadius: 10, marginBottom: 20 },
  flaggedRow: { backgroundColor: "#ffeaea" },
  actionBox: { backgroundColor: "#ffffff", padding: 18, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: "#ddd" },
  resolveCard: { backgroundColor: "#f9fbfd", width: "95%", borderRadius: 14, padding: 20 },
  resolveContainer: { flex: 1, padding: 20, backgroundColor: "#f9fbfd" },
  resolveTitle: { fontSize: 26, fontWeight: "bold", color: "#11493f", marginBottom: 20, textAlign: "center" },
  detailLabel: { fontWeight: "bold", marginTop: 8 },
  detailValue: { marginLeft: 10, marginBottom: 4, fontSize: 15 },
  resolveLabel: { fontSize: 16, fontWeight: "600", marginTop: 10, color: "#11493f" },
  resolvePicker: { backgroundColor: "#e6f0ff", borderRadius: 10, marginBottom: 12, height: 50 },
  resolveInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, height: 120, marginTop: 6, textAlignVertical: "top" },
  resolveButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelBtn: { backgroundColor: "#ccc", padding: 12, borderRadius: 10, width: "45%", alignItems: "center" },
  updateBtn: { backgroundColor: "#197278", padding: 12, borderRadius: 10, width: "45%", alignItems: "center" },
  widgetsRow: { flexDirection: "row", gap: 20, marginBottom: 12, justifyContent: "center", width: "100%",},
  widget: { flex: 1, minWidth: 180, maxWidth: 280, paddingVertical: 20, paddingHorizontal: 20, borderRadius: 12, alignItems: "center",},
  widgetTitle: {fontWeight: "700", fontSize: 16, marginBottom: 8, textAlign: "center",},
  widgetValue: {fontSize: 28, fontWeight: "bold", color: "#11493f",},
});