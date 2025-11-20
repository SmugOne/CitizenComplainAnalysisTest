import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const BASE_SIDEBAR_WIDTH = 240;
const BREAKPOINT = 900;
const HEADER_HEIGHT = 62;

export default function LayoutAdmin({ children, navigation }) {
  const { width: windowWidth } = useWindowDimensions();

  const computedSidebarWidth =
    windowWidth > BREAKPOINT ? BASE_SIDEBAR_WIDTH : Math.max(160, Math.floor(windowWidth * 0.68));

  const [isWide, setIsWide] = useState(windowWidth > BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(windowWidth > BREAKPOINT);
  const slide = useRef(new Animated.Value(sidebarOpen ? 0 : -computedSidebarWidth)).current;

  useEffect(() => {
    const wide = windowWidth > BREAKPOINT;
    setIsWide(wide);
    setSidebarOpen(wide ? true : false);
  }, [windowWidth]);

  useEffect(() => {
    slide.setValue(sidebarOpen ? 0 : -computedSidebarWidth);
    Animated.timing(slide, {
      toValue: sidebarOpen ? 0 : -computedSidebarWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, computedSidebarWidth, slide]);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  const nav = (route) => {
    if (!isWide) setSidebarOpen(false);
    if (navigation && route) navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={toggleSidebar}
            style={styles.hamburgerTouchable}
            accessible
            accessibilityLabel="Toggle menu"
          >
            <MaterialIcons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>ADMIN PANEL</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.bodyWrap}>
          {/* Sidebar */}
          <Animated.View
            pointerEvents={isWide ? "auto" : sidebarOpen ? "auto" : "none"}
            style={[
              styles.sidebar,
              isWide ? styles.sidebarInline : styles.sidebarOverlay,
              {
                width: computedSidebarWidth,
                transform: [{ translateX: slide }],
              },
            ]}
          >
            <ScrollView contentContainerStyle={styles.sidebarContent}>
              <TouchableOpacity onPress={() => nav("AdminDashboard")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav("ManageAdminUser")} style={styles.sidebarLink}>
              <Text style={styles.sidebarLinkText}>Manage Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav("StatisticsScreen")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Statistics</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity onPress={() => nav("CitizenHome")} style={styles.sidebarLink}>
                <Text style={[styles.sidebarLinkText, { color: "#ffd66b" }]}>Log out</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Backdrop */}
          {!isWide && sidebarOpen && (
            <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
              <View style={[styles.backdrop, { top: HEADER_HEIGHT }]} />
            </TouchableWithoutFeedback>
          )}

          {/* Main */}
          <View style={styles.mainArea}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.centeredContent}>{children}</View>
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Admin Panel © {new Date().getFullYear()} Citizen Complaint Portal
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    ...(Platform.OS === "web" ? { minHeight: "100vh" } : {}),
    backgroundColor: "#f7f1de",
  },
  container: { flex: 1, backgroundColor: "#f7f1de" },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: "#11493f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    zIndex: 60,
  },
  hamburgerTouchable: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    zIndex: 70,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#ffd66b",
    fontWeight: "700",
    fontSize: 18,
  },
  bodyWrap: { flex: 1, flexDirection: "row", position: "relative" },
  sidebar: {
    backgroundColor: "#11493f",
    zIndex: 50,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 6,
    elevation: 6,
    minWidth: 120,
    maxWidth: 420,
  },
  sidebarInline: { position: "relative" },
  sidebarOverlay: { position: "absolute", left: 0, top: 0, bottom: 0 },
  sidebarContent: { paddingTop: 20, paddingHorizontal: 12, paddingBottom: 30 },
  sidebarLink: { paddingVertical: 16, paddingHorizontal: 8 },
  sidebarLinkText: { color: "#fff", fontSize: 16 },
  divider: {
    height: 1,
    backgroundColor: "#ffd66b44",
    marginVertical: 14,
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 40,
  },
  mainArea: {
    flex: 1,
    zIndex: 10,
    flexDirection: "column",
    minHeight: 0,
    justifyContent: "flex-start",
  },
  contentContainer: { flexGrow: 1, paddingTop: 12, paddingBottom: 12, minHeight: 0 },
  centeredContent: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  footer: {
    marginTop: "auto",
    backgroundColor: "#fde2a6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: Platform.OS === "web" ? 20 : 0,
  },
  footerText: { color: "#11493f", fontStyle: "italic", textAlign: "center" },
});