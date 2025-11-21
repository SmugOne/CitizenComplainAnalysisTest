import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Layout from "../../components/Layout";
import { API_URL } from "@env";
import { Container, Row, Col, useResponsive } from "../../components/Bootstrap";

export default function HomeScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const resp = useResponsive();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/complaints`);
        const data = await response.json();

        if (Array.isArray(data)) {
          const resolved = data.filter(
            (c) => c.Status === "SOLVED" || c.Status === "SPAM"
          ).length;
          const total = data.filter(
            (c) =>
              c.Status === "UNSOLVED" ||
              c.Status === "SOLVED" ||
              c.Status === "SPAM" ||
              c.Status === "UNDER REVIEW"
          ).length;

          setResolvedCount(resolved);
          setTotalCount(total);
        }
      } catch (err) {
        console.error("Error fetching complaints stats:", err);
      }
    };

    fetchStats();

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_URL}/api/announcements`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.error("Error loading announcements:", err);
      }
    };

    fetchAnnouncements();

  }, []);

  // responsive typography
  const bannerFont = resp.isXs ? 20 : resp.isSm ? 28 : 36;
  const statsNumberFont = resp.isXs ? 34 : resp.isSm ? 48 : 64;
  const announceTitleFont = resp.isXs ? 16 : resp.isSm ? 18 : 20;

  return (
    <Layout navigation={navigation}>
      <Container>
        {/* Banner */}
        <View style={[styles.banner, resp.isXs ? styles.bannerSmall : null]}>
          <Text style={[styles.bannerTitle, { fontSize: bannerFont }]}>
            Welcome to Citizen Complaint Analysis System
          </Text>
        </View>

        {/* Stats + Announcements Row */}
        <Row style={{ marginBottom: 20 }}>
          <Col xs={12} md={5}>
            <View style={[styles.statsFrame, resp.isXs ? styles.statsFrameXs : null]}>
              <Text style={[styles.statsLabel, resp.isXs ? { fontSize: 15 } : null]}>
                Complaints Resolved
              </Text>
              <Text style={[styles.statsNumber, { fontSize: statsNumberFont }]}>
                {resolvedCount}
              </Text>
              <Text style={[styles.statsLabel, resp.isXs ? { fontSize: 15 } : null]}>
                Total Complaints
              </Text>
              <Text style={[styles.statsNumber, { fontSize: statsNumberFont }]}>
                {totalCount}
              </Text>
            </View>
          </Col>

          <Col xs={12} md={7}>
            <View style={styles.announcements}>
              {announcements.map((item, index) => (
                <View key={index} style={styles.announceCard}>
                  <Text style={styles.announceCardTitle}>{item.Title}</Text>
                  <Text style={styles.announceBody}>{item.Body}</Text>
                </View>
              ))}
            </View>
          </Col>
        </Row>

        {/* How It Works (full width block below row) */}
        <View style={[styles.howItWorks, resp.isXs ? { padding: 14 } : null]}>
          <Text style={[styles.howTitle, resp.isXs ? { fontSize: 16 } : null]}>How It Works</Text>

          <View style={styles.infographicStep}>
            <View style={styles.circleSm}><Text style={styles.circleText}>1</Text></View>
            <Text style={styles.infoTextSm}>Submit your complaint</Text>
          </View>

          <View style={styles.infographicStep}>
            <View style={styles.circleSm}><Text style={styles.circleText}>2</Text></View>
            <Text style={styles.infoTextSm}>We analyze and assign your case</Text>
          </View>

          <View style={styles.infographicStep}>
            <View style={styles.circleSm}><Text style={styles.circleText}>3</Text></View>
            <Text style={styles.infoTextSm}>You track progress & status online</Text>
          </View>

          <View style={styles.infographicStep}>
            <View style={styles.circleSm}><Text style={styles.circleText}>4</Text></View>
            <Text style={styles.infoTextSm}>Issue resolved, feedback welcomed!</Text>
          </View>
        </View>
      </Container>
    </Layout>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#11493f",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 18,
  },
  bannerSmall: {
    paddingVertical: 16,
  },
  bannerTitle: {
    color: "#ffd66b",
    fontWeight: "800",
    textAlign: "center",
  },

  statsFrame: {
    alignSelf: "center",
    marginBottom: 18,
    backgroundColor: "#fffbe8",
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#ffd66b",
    paddingHorizontal: 30,
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    width: "100%",
  },
  statsFrameXs: {
    paddingHorizontal: 18,
  },
  statsLabel: {
    fontSize: 18,
    color: "#11493f",
    fontWeight: "600",
    marginTop: 7,
  },
  statsNumber: {
    fontSize: 36,
    color: "#f4aa1c",
    marginTop: -2,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },

  middleSection: {
    flexDirection: "row",
    marginBottom: 22,
    gap: 30,
    minHeight: 200,
  },

  howItWorksSmall: {
    flex: 0.85,
    backgroundColor: "#e8f0ea",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: "flex-start",
    maxWidth: 260,
    minWidth: 165,
    elevation: 1,
  },

  howItWorks: {
    backgroundColor: "#e8f0ea",
    borderRadius: 12,
    padding: 20,
    marginTop: 18,
  },
  howTitle: {
    fontWeight: "bold",
    fontSize: 15.5,
    marginBottom: 10,
    color: "#11493f",
  },

  infographicStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  circleSm: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffd66b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  circleText: {
    color: "#11493f",
    fontWeight: "bold",
    fontSize: 13,
  },
  infoTextSm: {
    fontSize: 14,
    color: "#11493f",
    flexShrink: 1,
  },

  announcements: {
    backgroundColor: "#fffbe8",
    borderRadius: 12,
    padding: 18,
    marginLeft: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 12,
    color: "#11493f",
  },
  announceCard: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffe8aa",
  },
  announceCardTitle: {
    fontWeight: "700",
    color: "#11493f",
    marginBottom: 6,
  },
  announceBody: { color: "#444" },
});