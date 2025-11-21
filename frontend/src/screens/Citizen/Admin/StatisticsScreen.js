import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import Layout from "../../../components/LayoutAdmin";
import { API_URL } from "@env";
import { BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function StatisticsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  const fetchStats = () => {
    setFetchError(false);
    fetch(`${API_URL}/api/admin/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setFetchError(true));
  };

  useEffect(() => {
    fetchStats();
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

  const pieData =
    stats?.statusCounts
      ? Object.entries(stats.statusCounts).map(([label, value], i) => ({
          name: label,
          population: value,
          color: ["#197278", "#f59e0b", "#16a34a", "#ef4444"][i % 4],
          legendFontColor: "#11493f",
          legendFontSize: 12,
        }))
      : [];

  return (
    <Layout navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Statistics Overview</Text>

        {stats ? (
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={styles.chartsRow}>
              {/* Complaints by Category */}
              <View style={[styles.chartCol, { width: Math.min(900, screenWidth * 0.9) }]}>
                <Text style={styles.graphTitle}>Complaints by Category</Text>
                <BarChart
                  key={JSON.stringify(stats.categoryCounts)}
                  data={{
                    labels: Object.keys(stats.categoryCounts || {}),
                    datasets: [{ data: Object.values(stats.categoryCounts || {}) }],
                  }}
                  width={Math.min(900, screenWidth * 0.9)}
                  height={350}
                  fromZero
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

              {/* Complaints by Status */}
              <View style={[styles.chartCol, { width: Math.min(420, screenWidth * 0.5) }]}>
                <Text style={styles.graphTitle}>Complaints by Status</Text>
                <BarChart
                  key={JSON.stringify(stats.statusCounts)}
                  data={{
                    labels: Object.keys(stats.statusCounts || {}),
                    datasets: [{ data: Object.values(stats.statusCounts || {}) }],
                  }}
                  width={Math.min(420, screenWidth * 0.5)}
                  height={350}
                  fromZero
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
              <View style={[styles.chartCol, { width: 300 }]}>
                <Text style={styles.graphTitle}>Status Distribution</Text>
                {pieData.length > 0 && (
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
                    absolute
                  />
                )}
              </View>
            </View>
          </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#11493f",
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  chartsRow: {
    flexDirection: "row",
    gap: 30,
    minWidth: screenWidth * 1.2,
  },
  chartCol: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#11493f",
    marginBottom: 10,
  },
});
