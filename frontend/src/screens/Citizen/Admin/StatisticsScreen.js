import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Svg, Path, Circle, G, Text as SvgText, Rect, Line } from "react-native-svg";
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
    complaintsByStatus: [],
    departmentData: []
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/stats`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const statusColors = {
          'SOLVED': '#27ae60',
          'SPAM': '#e74c3c',
          'UNDER REVIEW': '#f39c12',
          'UNSOLVED': '#95a5a6'
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

        const complaintsByStatus = STATUS_OPTIONS.map(status => ({
          label: status,
          value: data.statusCounts?.[status] || 0
        }));

        setStats({
          statusData: statusData.length > 0 ? statusData : [{ label: "No Data", value: 1, color: "#ddd" }],
          complaintsByStatus,
          departmentData
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
        
        {/* Responsive Grid Layout */}
        <Row gutter={20}>
          {/* Pie Chart - Full width on mobile, 5/12 on desktop */}
          <Col xs={12} lg={5}>
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Status Distribution</Text>
              <PieChart data={stats.statusData} />
            </Card>
          </Col>

          {/* Bar Charts Column - Full width on mobile, 7/12 on desktop */}
          <Col xs={12} lg={7}>
            <Row gutter={20}>
              {/* Complaints by Status */}
              <Col xs={12}>
                <Card style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Complaints by Status</Text>
                  <BarChart 
                    data={stats.complaintsByStatus} 
                    isCompact={true}
                  />
                </Card>
              </Col>

              {/* Department Distribution */}
              <Col xs={12}>
                <Card style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Department Distribution</Text>
                  <BarChart 
                    data={stats.departmentData} 
                    isCompact={false}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

function PieChart({ data }) {
  const { width, isXs, isSm, isMd, isLg, isXl } = useResponsive();
  
  // Responsive sizing - fits within container
  let size;
  if (isXl) {
    size = 360;
  } else if (isLg) {
    size = 320;
  } else if (isMd) {
    size = 300;
  } else if (isSm) {
    size = Math.min(width * 0.6, 280);
  } else {
    size = Math.min(width - 120, 260);
  }
  
  const radius = size / 3;
  const cx = size / 2;
  const cy = size / 2.8;

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

  // Responsive legend layout
  const legendY = cy + radius + 50;
  const itemWidth = isXl || isLg ? 140 : isMd || isSm ? 120 : 100;
  const legendItemsPerRow = (isXl || isLg || isMd || isSm) ? 2 : 1;
  
  return (
    <View style={styles.pieChartContainer}>
      <Svg width={size} height={size + 100}>
        {slices.map((slice, i) => (
          <Path key={i} d={slice.pathData} fill={slice.color} stroke="#fff" strokeWidth={2} />
        ))}
        {/* Horizontal Legend */}
        <G>
          {data.map((item, i) => {
            const row = Math.floor(i / legendItemsPerRow);
            const col = i % legendItemsPerRow;
            const x = (size / 2) - (legendItemsPerRow * itemWidth / 2) + (col * itemWidth);
            const y = legendY + (row * 28);
            
            return (
              <G key={i}>
                <Circle cx={x} cy={y} r={7} fill={item.color} />
                <SvgText x={x + 15} y={y + 5} fontSize={12} fill="#333" fontWeight="500">
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
  
  // Calculate available width based on container and sidebar
  // Account for: sidebar width, Container padding, Card padding, Col padding
  let availableWidth;
  
  if (isXl) {
    // Ultra-wide screens
    availableWidth = Math.min(width * 0.5, 800);
  } else if (isLg) {
    // Desktop with sidebar
    availableWidth = Math.min((width - 240) * 0.55, 700);
  } else if (isMd) {
    // Tablet
    availableWidth = Math.min(width - 150, 600);
  } else if (isSm) {
    // Small tablet
    availableWidth = Math.min(width - 120, 500);
  } else {
    // Mobile
    availableWidth = width - 90;
  }
  
  const chartHeight = isCompact ? 260 : 300;
  const chartWidth = Math.max(availableWidth, 300); // Minimum width
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const numBars = data.length;
  
  // Calculate bar layout to fit within available width
  const leftMargin = 50;
  const rightMargin = 20;
  const usableWidth = chartWidth - leftMargin - rightMargin;
  
  const minBarWidth = 20;
  const maxBarWidth = isCompact ? 55 : 45;
  const minSpacing = 6;
  const maxSpacing = 18;
  
  // Calculate optimal bar width and spacing
  let barWidth = (usableWidth - (minSpacing * (numBars - 1))) / numBars;
  barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, barWidth));
  
  let barSpacing = (usableWidth - (barWidth * numBars)) / Math.max(numBars - 1, 1);
  barSpacing = Math.max(minSpacing, Math.min(maxSpacing, barSpacing));
  
  // Recalculate if bars are too wide
  if (barWidth * numBars + barSpacing * (numBars - 1) > usableWidth) {
    barWidth = (usableWidth - (minSpacing * (numBars - 1))) / numBars;
    barSpacing = minSpacing;
  }

  // Y-axis values: 0, 10, 30, 50, 100
  const yAxisValues = [0, 10, 30, 50, 100];

  return (
    <View style={styles.barChartContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.barChartScrollContent}
      >
        <Svg width={Math.max(chartWidth, numBars * (barWidth + barSpacing) + leftMargin + rightMargin)} height={chartHeight}>
          {/* Grid lines and Y-axis labels */}
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
                <SvgText x={leftMargin - 10} y={y + 4} fontSize={11} fill="#666" textAnchor="end" fontWeight="500">
                  {value}
                </SvgText>
              </G>
            );
          })}

          {/* Bars */}
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
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#11493f',
    marginBottom: 25,
    textAlign: 'center',
  },
  chartCard: {
    minHeight: 200,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11493f',
    marginBottom: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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