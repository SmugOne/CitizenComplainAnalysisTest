import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";
import { BarChart, PieChart } from "react-native-chart-kit";

const CATEGORY_OPTIONS = [
  "All",
  "Infrastructure",
  "Public Services",
  "Safety & Security",
  "Environment",
  "Administrative Issues",
  "Community Concerns"
];
const STATUS_OPTIONS = ["All", "On Going", "Accomplished", "Failed"];
const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
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

    fetch(`${API_URL}/api/admin/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const filteredComplaints = complaints.filter(row => {
    const cat = row["Predicted Agency"] || row["Category"] || "";
    const stat = row["Status"] || "";
    const categoryMatch = category === "All" || cat === category;
    const statusMatch = status === "All" || stat === status;
    return categoryMatch && statusMatch;
  });

  const flaggedCount = filteredComplaints.filter(row => row["Flagged Words"] === true || row["Flagged Words"] === "True").length;
  const avgSeverity = filteredComplaints.length
    ? (
        filteredComplaints.reduce(
          (sum, row) => sum + (parseFloat(row["Anger Score"]) || 0) + (parseFloat(row["Fear Score"]) || 0) + (parseFloat(row["Sadness Score"]) || 0),
          0
        ) /
        (filteredComplaints.length * 3)
      ).toFixed(2)
    : "0.00";

  const pieData =
    stats &&
    Object.entries(stats.statusCounts).map(([key, value], idx) => ({
      name: key,
      population: value,
      color: ["#2563EB", "#16A34A", "#DC2626"][idx] || "#ccc",
      legendFontColor: "#11493f",
      legendFontSize: 14
    }));

  // Use a large minWidth to trigger horizontal scroll when graphs/table overflow
  const dashboardMinWidth = 1400;
  const widgetWidth = 320;

  return (
    <Layout navigation={navigation}>
      <ScrollView horizontal style={{ width: "100%" }}>
        <View style={[styles.dashboardCard, { minWidth: dashboardMinWidth, width: "100%" }]}>
          <Text style={styles.title}>Admin Dashboard</Text>

          {/* Filters */}
          <View style={styles.filtersRow}>
            <View style={styles.filter}>
              <Text style={styles.label}>Complaint Category Stats</Text>
              <Picker
                selectedValue={category}
                style={styles.picker}
                onValueChange={setCategory}
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <Picker.Item label={opt} value={opt} key={opt} />
                ))}
              </Picker>
            </View>
            <View style={styles.filter}>
              <Text style={styles.label}>Status of Complaints</Text>
              <Picker
                selectedValue={status}
                style={styles.picker}
                onValueChange={setStatus}
              >
                {STATUS_OPTIONS.map(opt => (
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
              <Text style={[styles.widgetTitle, { color: "#c00" }]}>Flagged Complaints</Text>
              <Text style={[styles.widgetValue, { color: "#c00" }]}>{flaggedCount}</Text>
            </View>
            <View style={[styles.widget, { backgroundColor: "#eafbe5" }]}>
              <Text style={[styles.widgetTitle, { color: "#197278" }]}>Avg. Severity Score</Text>
              <Text style={styles.widgetValue}>{avgSeverity}</Text>
            </View>
          </View>

          {/* Table */}
          <ScrollView horizontal style={{ width: "100%" }}>
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
                <Text style={{ margin: 10, color: "#11493f" }}>No complaints found for the selected filters.</Text>
              ) : (
                filteredComplaints.map(row => {
                  const isFlagged = row["Flagged Words"] === true || row["Flagged Words"] === "True";
                  return (
                    <View
                      style={[
                        styles.tableRow,
                        isFlagged && styles.flaggedRow
                      ]}
                      key={row.ID}
                    >
                      <Text style={styles.cell}>
                        {isFlagged ? "🚩 " : ""}
                        {row.ID}
                      </Text>
                      <Text style={styles.cell}>{row.Name}</Text>
                      <Text style={[styles.cell, { width: 320, textAlign: "left" }]}>{row.Complaint}</Text>
                      <Text style={styles.cell}>{row["Predicted Agency"] || row["Category"]}</Text>
                      <Text
                        style={[
                          styles.cell,
                          { fontWeight: "bold", color: "#197278" },
                          isFlagged && { color: "#DC2626" }
                        ]}
                      >
                        {row.Status}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>

          {/* Charts */}
          <View style={styles.chartsGrid}>
            <View style={styles.chartCol}>
              <Text style={styles.graphTitle}>Complaints by Category</Text>
              {stats && (
                <BarChart
                  data={{
                    labels: Object.keys(stats.categoryCounts),
                    datasets: [{ data: Object.values(stats.categoryCounts) }]
                  }}
                  width={600} // wider width for more space for rotated labels
                  height={220}
                  fromZero
                  showBarTops={false}
                  withInnerLines
                  verticalLabelRotation={30}
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: () => "#197278",
                    labelColor: () => "#11493f",
                    barPercentage: 0.7,
                    style: {}
                  }}
                  style={{ marginBottom: 0, backgroundColor: "transparent" }}
                />
              )}
            </View>
            <View style={styles.chartCol}>
              <Text style={styles.graphTitle}>Complaints by Status</Text>
              {stats && (
                <BarChart
                  data={{
                    labels: Object.keys(stats.statusCounts),
                    datasets: [{ data: Object.values(stats.statusCounts) }]
                  }}
                  width={420}
                  height={220}
                  fromZero
                  showBarTops={false}
                  withInnerLines
                  verticalLabelRotation={30}
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: () => "#16A34A",
                    labelColor: () => "#11493f",
                    barPercentage: 0.7,
                    style: {}
                  }}
                  style={{ marginBottom: 0, backgroundColor: "transparent" }}
                />
              )}
            </View>
            <View style={styles.chartCol}>
              <Text style={styles.graphTitle}>Status Distribution</Text>
              {pieData && (
                <PieChart
                  data={pieData}
                  width={280}
                  height={220}
                  chartConfig={{
                    color: () => "#197278",
                    labelColor: () => "#11493f"
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="8"
                  center={[10, 0]}
                  absolute
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  dashboardCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 32,
    alignSelf: "flex-start",
    width: "100%",
    maxWidth: 1800,
    minHeight: 400,
    marginBottom: 32,
    elevation: 3,
    shadowColor: "#197278",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 }
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#11493f",
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "sans-serif"
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
  },
  chartsGrid: {
    width: "100%",
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 40
  },
  chartCol: {
    alignItems: "center",
    flex: 1
  },
  graphTitle: {
    fontWeight: "bold",
    color: "#11493f",
    marginBottom: 6,
    fontSize: 17,
    textAlign: "center"
  }
});