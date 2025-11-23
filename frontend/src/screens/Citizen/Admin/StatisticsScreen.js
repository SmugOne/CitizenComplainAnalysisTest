import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { Svg, Path, Circle, G, Text as SvgText, Rect, Line } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../../components/LayoutAdmin";
import { Container, Row, Col, Card, useResponsive } from "../../../components/Bootstrap";
import { API_URL } from "@env";

const AGENCY_OPTIONS = [
  "DPWH", "DOH", "DENR", "OMBUDSMAN",
  "LTO", "MMDA", "PNP", "DEPED",
  "BFP", "DOTR", "DITC", "NONE"
];

const STATUS_OPTIONS = ["SOLVED", "SPAM", "UNDER REVIEW", "UNSOLVED"];

export default function StatisticsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    statusData: [],
    departmentData: [],
    allComplaints: []
  });
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    console.log("🔄 STATUS FILTER CHANGED TO:", statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/stats`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched data:", data);
        
        const statusColors = {
          'SOLVED': '#27ae60',
          'SPAM': '#e74c3c',
          'UNDER REVIEW': '#f39c12',
          'UNSOLVED': '#2c3e50'
        };

        const statusData = STATUS_OPTIONS
          .map(status => ({
            label: status,
            value: data.statusCounts?.[status] || 0,
            color: statusColors[status]
          }))
          .filter(item => item.value > 0);

        const departmentData = AGENCY_OPTIONS.map(agency => ({
          label: agency,
          value: data.categoryCounts?.[agency] || 0
        }));

        const allComplaints = data.complaints || [];
        console.log("All complaints:", allComplaints.length);

        setStats({
          statusData: statusData.length > 0 ? statusData : [{ label: "No Data", value: 1, color: "#ddd" }],
          departmentData,
          allComplaints
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(true);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Get filtered pie chart data ONLY - does NOT affect bar chart
  const getFilteredStatusData = () => {
    const statusColors = {
      'SOLVED': '#27ae60',
      'SPAM': '#e74c3c',
      'UNDER REVIEW': '#f39c12',
      'UNSOLVED': '#2c3e50'
    };

    console.log("Getting pie chart data for filter:", statusFilter);
    console.log("Original status data:", stats.statusData);

    if (statusFilter === "ALL") {
      return stats.statusData;
    }
    
    // Return all statuses but change colors based on filter
    const filteredData = STATUS_OPTIONS.map(status => {
      const originalData = stats.statusData.find(s => s.label === status);
      const value = originalData ? originalData.value : 0;
      const color = status === statusFilter ? statusColors[status] : '#d3d3d3'; // Gray out non-selected
      
      return {
        label: status,
        value: value,
        color: color
      };
    }).filter(item => item.value > 0);

    console.log("Filtered pie chart data:", filteredData);
    return filteredData.length > 0 ? filteredData : [{ label: "No Data", value: 1, color: "#ddd" }];
  };

  if (loading) {
    return (
      <Layout navigation={navigation}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#11493f" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout navigation={navigation}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error loading dashboard data.</Text>
          <Text style={styles.errorSubtext}>Please check your connection and try again.</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout navigation={navigation}>
      <Container maxWidth={1600} fluid style={styles.container}>
        <Text style={styles.pageTitle}>Statistics Overview</Text>
        
        <Row gutter={20}>
          {/* Pie Chart with Filter - ONLY THIS CHART GETS FILTERED */}
          <Col xs={12} lg={5}>
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Status Distribution</Text>
                
                {/* Simple Select Dropdown */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #d0d0d0',
                    borderRadius: '8px',
                    color: '#11493f',
                    cursor: 'pointer',
                    minWidth: '140px',
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="SOLVED">SOLVED</option>
                  <option value="SPAM">SPAM</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="UNSOLVED">UNSOLVED</option>
                </select>
              </View>
              
              {/* Pass FILTERED data to pie chart */}
              <PieChart data={getFilteredStatusData()} statusFilter={statusFilter} />
            </Card>
          </Col>

          {/* Bar Chart - ALWAYS SHOWS ALL DATA, NO FILTERING */}
          <Col xs={12} lg={7}>
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Department Distribution</Text>
              {/* Pass UNFILTERED stats.departmentData directly */}
              <BarChart 
                data={stats.departmentData}
                isCompact={false}
              />
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

function PieChart({ data, statusFilter }) {
  const { width, isXs, isSm, isMd, isLg, isXl } = useResponsive();
  
  let size;
  if (isXl) {
    size = 440;
  } else if (isLg) {
    size = 400;
  } else if (isMd) {
    size = 380;
  } else if (isSm) {
    size = Math.min(width * 0.7, 360);
  } else {
    size = Math.min(width - 100, 320);
  }
  
  const radius = size / 2.8;
  const cx = size / 2;
  const cy = size / 2.5;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <View style={styles.pieChartContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  let currentAngle = -90;
  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return { pathData, color: item.color, label: item.label, value: item.value };
  });

  const legendY = cy + radius + 60;
  const itemWidth = isXl || isLg ? 150 : isMd || isSm ? 130 : 110;
  const legendItemsPerRow = (isXl || isLg || isMd || isSm) ? 2 : 1;
  
  return (
    <View style={styles.pieChartContainer}>
      <Svg width={size} height={size + 140}>
        {slices.map((slice, i) => (
          <Path key={i} d={slice.pathData} fill={slice.color} stroke="#fff" strokeWidth={2} />
        ))}
        <G>
          {data.map((item, i) => {
            const row = Math.floor(i / legendItemsPerRow);
            const col = i % legendItemsPerRow;
            const x = (size / 2) - (legendItemsPerRow * itemWidth / 2) + (col * itemWidth);
            const y = legendY + (row * 30);
            
            return (
              <G key={i}>
                <Circle cx={x} cy={y} r={8} fill={item.color} />
                <SvgText x={x + 16} y={y + 5} fontSize={14} fill="#333" fontWeight="500" fontFamily="Poppins">
                  {item.value} {item.label}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

function BarChart({ data, isCompact = false }) {
  const { width, isXs, isSm, isMd, isLg, isXl } = useResponsive();
  
  let availableWidth;
  
  if (isXl) {
    availableWidth = Math.min(width * 0.5, 800);
  } else if (isLg) {
    availableWidth = Math.min((width - 240) * 0.55, 700);
  } else if (isMd) {
    availableWidth = Math.min(width - 150, 600);
  } else if (isSm) {
    availableWidth = Math.min(width - 120, 500);
  } else {
    availableWidth = width - 90;
  }
  
  const chartHeight = isCompact ? 260 : 300;
  const chartWidth = Math.max(availableWidth, 300);
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const numBars = data.length;
  
  const leftMargin = 50;
  const rightMargin = 20;
  const usableWidth = chartWidth - leftMargin - rightMargin;
  
  const minBarWidth = 20;
  const maxBarWidth = isCompact ? 55 : 45;
  const minSpacing = 6;
  const maxSpacing = 18;
  
  let barWidth = (usableWidth - (minSpacing * (numBars - 1))) / numBars;
  barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, barWidth));
  
  let barSpacing = (usableWidth - (barWidth * numBars)) / Math.max(numBars - 1, 1);
  barSpacing = Math.max(minSpacing, Math.min(maxSpacing, barSpacing));
  
  if (barWidth * numBars + barSpacing * (numBars - 1) > usableWidth) {
    barWidth = (usableWidth - (minSpacing * (numBars - 1))) / numBars;
    barSpacing = minSpacing;
  }

  const yAxisValues = [0, 10, 30, 50, 100];

  return (
    <View style={styles.barChartContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.barChartScrollContent}
      >
        <Svg width={Math.max(chartWidth, numBars * (barWidth + barSpacing) + leftMargin + rightMargin)} height={chartHeight}>
          {yAxisValues.map((value, i) => {
            const y = chartHeight - 52 - (value / 100) * (chartHeight - 75);
            return (
              <G key={i}>
                <Line 
                  x1={leftMargin - 5} 
                  y1={y} 
                  x2={chartWidth - rightMargin} 
                  y2={y} 
                  stroke="#e0e0e0" 
                  strokeWidth={1} 
                  strokeDasharray="3,3" 
                />
                <SvgText x={leftMargin - 10} y={y + 4} fontSize={11} fill="#666" textAnchor="end" fontWeight="500" fontFamily="Poppins">
                  {value}
                </SvgText>
              </G>
            );
          })}

          {data.map((item, i) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * (chartHeight - 75) : 0;
            const x = leftMargin + i * (barWidth + barSpacing);
            const y = chartHeight - 52 - barHeight;

            return (
              <G key={i}>
                <Rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={Math.max(barHeight, 2)} 
                  fill="#27ae60" 
                  rx={4} 
                />
                {item.value > 0 && (
                  <SvgText 
                    x={x + barWidth / 2} 
                    y={y - 8} 
                    fontSize={13} 
                    fontWeight="700" 
                    fill="#11493f" 
                    textAnchor="middle"
                    fontFamily="Poppins"
                  >
                    {item.value}
                  </SvgText>
                )}
                <SvgText 
                  x={x + barWidth / 2} 
                  y={chartHeight - 28} 
                  fontSize={isXs ? 9 : 10} 
                  fill="#666" 
                  textAnchor="middle" 
                  fontWeight="500"
                  fontFamily="Poppins"
                >
                  {item.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#11493f',
    fontFamily: 'Poppins',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#11493f',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  chartCard: {
    minHeight: 200,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11493f',
    fontFamily: 'Poppins',
  },
  filterWrapper: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    minWidth: 140,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#11493f',
    marginRight: 4,
    fontFamily: 'Poppins',
  },
  dropdownOverlay: {
    position: 'fixed',
    top: 220,
    right: 50,
    zIndex: 100000,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
    minWidth: 180,
  },
  dropdownBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 99999,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: {
    backgroundColor: '#e8f5e9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins',
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: '#27ae60',
    fontFamily: 'Poppins',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingTop: 30,
    width: '100%',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'Poppins',
  },
  barChartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barChartScrollContent: {
    paddingRight: 10,
  },
});