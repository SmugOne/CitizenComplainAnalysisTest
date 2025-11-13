import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";

const CATEGORY_OPTIONS = [
  "All",
  "Infrastructure",
  "Public Services",
  "Safety & Security",
  "Environment",
  "Administrative Issues",
  "Community Concerns"
];
//const STATUS_OPTIONS = ["Unsolved", "Solved", "Accomplished", "Failed"];

export default function DashboardScreen({ navigation }) {
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

  const filteredComplaints = complaints.filter(row => {
    const cat = row["Predicted Agency"] || row["Category"] || "";
    const stat = row["Status"] || "";
    const categoryMatch = category === "All" || cat === category;
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
          {/*<View style={styles.filter}>
            <Text style={styles.label}>Status of Complaints</Text>
            <Picker
              selectedValue={status}
              style={styles.picker}
              onValueChange={setStatus}>
              {STATUS_OPTIONS.map(opt => (
                <Picker.Item label={opt} value={opt} key={opt} />
              ))}
            </Picker>
          </View>*/}
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
        <View style={{ maxHeight: 400, width: "100%", marginTop: 20 }}>
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>ID</Text>
                <Text style={styles.headerCell}>Name</Text>
                <Text style={styles.headerCell}>Complaint</Text>
                <Text style={styles.headerCell}>Category</Text>
                <Text style={styles.headerCell}>Status</Text>
              </View>

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
                      <Text style={styles.cell}>
                        {isFlagged ? "🚩 " : ""}
                        {row.ID}
                      </Text>
                      <Text style={styles.cell}>{row.Name}</Text>
                      <Text style={[styles.cell, { width: 320, textAlign: "left" }]}>
                        {row.Complaint}
                      </Text>
                      <Text style={styles.cell}>
                        {row["Predicted Agency"] || row["Category"]}
                      </Text>
                      <Text
                        style={[
                          styles.cell,
                          { fontWeight: "bold", color: "#197278" },
                          isFlagged && { color: "#DC2626" },
                        ]}>
                        {row.Status}
                      </Text>
                    </View>
                  );
                })
              )}
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