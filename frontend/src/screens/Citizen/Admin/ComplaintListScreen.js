import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";

// Column widths
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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilterActive, setStatusFilterActive] = useState("All");
  const [statusFilterArchive, setStatusFilterArchive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, archiveRes] = await Promise.all([
          fetch(`${API_URL}/api/active_complaints`),
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

  const activeFiltered = filterComplaints(activeComplaints, categoryFilter, statusFilterActive);
  const archiveFiltered = filterComplaints(archivedComplaints, categoryFilter, statusFilterArchive);

  return (
    <Layout navigation={navigation}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.title}>Active Complaints</Text>

        {/* Filters */}
        <View style={styles.filterRow}>
          <Picker
            selectedValue={categoryFilter}
            style={styles.picker}
            onValueChange={setCategoryFilter}
          >
            {CATEGORY_OPTIONS.map(opt => <Picker.Item label={opt} value={opt} key={opt} />)}
          </Picker>

          <Picker
            selectedValue={statusFilterActive}
            style={styles.picker}
            onValueChange={setStatusFilterActive}
          >
            {STATUS_OPTIONS_ACTIVE.map(opt => <Picker.Item label={opt} value={opt} key={opt} />)}
          </Picker>
        </View>

        {/* Active complaints table */}
        <ScrollView style={{ maxHeight: 300 }}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.ID }]}>ID</Text>
              <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Name }]}>Name</Text>
              <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Complaint }]}>Complaint</Text>
              <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Category }]}>Category</Text>
              <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Status }]}>Status</Text>
              <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Location }]}>Location</Text>
              <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.Action }]}>Action</Text>
            </View>
            {loading ? (
              <Text style={{ margin: 10, color: "#11493f" }}>Loading...</Text>
            ) : fetchError ? (
              <Text style={{ margin: 10, color: "red" }}>Error loading data.</Text>
            ) : activeFiltered.length === 0 ? (
              <Text style={{ margin: 10, color: "#11493f" }}>No active complaints found.</Text>
            ) : (
              activeFiltered.map(c => (
                <View style={styles.tableRow} key={c.ID || c.id}>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS.ID }]}>{c.ID || c.id}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS.Name }]}>{c.Name}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS.Complaint, textAlign: "left" }]}>{c.Complaint || c["Raw Complaint"]}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS.Category }]}>{c["Predicted Agency"] || c["Category"]}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS.Status }]}>{c.Status}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS.Location }]}>{c.Location}</Text>
                  <TouchableOpacity
                    style={[styles.actionBtn, { width: COLUMN_WIDTHS.Action }]}
                    onPress={() => navigation.navigate("ComplaintStatus", { complaintId: c.ID || c.id })}
                  >
                    <Text style={styles.actionBtnText}>Resolve</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Archived complaints */}
        <Text style={[styles.title, { marginTop: 24 }]}>Archived Complaints</Text>

        {/* Filters */}
        <View style={styles.filterRow}>
          <Picker
            selectedValue={categoryFilter}
            style={styles.picker}
            onValueChange={setCategoryFilter}
          >
            {CATEGORY_OPTIONS.map(opt => <Picker.Item label={opt} value={opt} key={opt} />)}
          </Picker>

          <Picker
            selectedValue={statusFilterArchive}
            style={styles.picker}
            onValueChange={setStatusFilterArchive}
          >
            {STATUS_OPTIONS_ARCHIVE.map(opt => <Picker.Item label={opt} value={opt} key={opt} />)}
          </Picker>
        </View>

        <ScrollView style={{ maxHeight: 300 }}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: 60 }]}>ID</Text>
              <Text style={[styles.headerCell, { width: 120 }]}>Name</Text>
              <Text style={[styles.headerCell, { width: 320 }]}>Complaint</Text>
              <Text style={[styles.headerCell, { width: 150 }]}>Location</Text>
              <Text style={[styles.headerCell, { width: 120 }]}>Agency</Text>
              <Text style={[styles.headerCell, { width: 120 }]}>Image ID</Text>
              <Text style={[styles.headerCell, { width: 100 }]}>Status</Text>
              <Text style={[styles.headerCell, { width: 150 }]}>Remark</Text>
              <Text style={[styles.headerCell, { width: 150 }]}>Feedback</Text>
            </View>
            {loading ? (
              <Text style={{ margin: 10, color: "#11493f" }}>Loading...</Text>
            ) : fetchError ? (
              <Text style={{ margin: 10, color: "red" }}>Error loading data.</Text>
            ) : archiveFiltered.length === 0 ? (
              <Text style={{ margin: 10, color: "#11493f" }}>No archived complaints found.</Text>
            ) : (
              archiveFiltered.map(c => (
                <View style={styles.tableRow} key={c.ID || c.id}>
                    <Text style={[styles.cell, { width: 60 }]}>{c.ID || c.id}</Text>
                    <Text style={[styles.cell, { width: 120 }]}>{c.Name}</Text>
                    <Text style={[styles.cell, { width: 320, textAlign: "left" }]}>{c.Complaint || c["Raw Complaint"]}</Text>
                    <Text style={[styles.cell, { width: 150 }]}>{c.Location}</Text>
                    <Text style={[styles.cell, { width: 120 }]}>{c.Agency || c["Predicted Agency"] || c["Category"]}</Text>
                    <Text style={[styles.cell, { width: 120 }]}>{c["Image ID"]}</Text>
                    <Text style={[styles.cell, { width: 100 }]}>{c.Status}</Text>
                    <Text style={[styles.cell, { width: 150 }]}>{c.Remark || ""}</Text>
                    <Text style={[styles.cell, { width: 150 }]}>{c.Feedback || ""}</Text>
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
