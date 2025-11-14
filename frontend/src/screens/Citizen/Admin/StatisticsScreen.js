import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";
import { Picker } from "@react-native-picker/picker";

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
const STATUS_OPTIONS = ["Unsolved", "Solved", "Spam",]; 

const screenWidth = Dimensions.get("window").width;

export default function StatisticsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setFetchError(true));
  }, []);

  if (fetchError) {
    return (
      <Layout navigation={navigation}>
        <View style={styles.center}>
          <Text style={{ color: "red" }}>Failed to fetch statistics data.</Text>
        </View>
      </Layout>
    );
  }

  // Build pie data safely
  const pieData =
    stats?.statusCounts &&
    Object.entries(stats.statusCounts).map(([label, value], i) => ({
      name: label,
      population: value,
      color: ["#197278", "#f59e0b", "#16a34a", "#ef4444"][i % 4],
      legendFontColor: "#11493f",
      legendFontSize: 12,
    }));

  return (
    <Layout navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Statistics Overview</Text>

        {stats ? (
              <View style={{ width: 1400 }}>
                <View style={styles.chartsGrid}>
                  {/* Complaints by Category */}
                  <View style={styles.chartCol}>
                    <Text style={styles.graphTitle}>Complaints by Category</Text>
                    <BarChart
                      data={{
                        labels: Object.keys(stats.categoryCounts),
                        datasets: [{ data: Object.values(stats.categoryCounts) }],
                      }}
                      width={600}
                      height={350}
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
                      }}
                      style={{ backgroundColor: "transparent" }}
                    />
                  </View>

                  {/* Complaints by Status */}
                  <View style={styles.chartCol}>
                    <Text style={styles.graphTitle}>Complaints by Status</Text>
                    <BarChart
                      data={{
                        labels: Object.keys(stats.statusCounts),
                        datasets: [{ data: Object.values(stats.statusCounts) }],
                      }}
                      width={420}
                      height={350}
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
                      }}
                    />
                  </View>

                  {/* Pie Chart */}
                  <View style={styles.chartCol}>
                    <Text style={styles.graphTitle}>Status Distribution</Text>
                    {pieData && (
                      <PieChart
                        data={pieData}
                        width={280}
                        height={220}
                        chartConfig={{
                          color: () => "#197278",
                          labelColor: () => "#11493f",
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
          
        ) : (
          <View style={styles.center}>
            <Text>Loading statistics...</Text>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#11493f",
    marginBottom: 16,
    textAlign: "center",
  },
  chartsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    gap: 30,
  },
  chartCol: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 350,
    alignItems: "center",
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#197278",
    marginBottom: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
