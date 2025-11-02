import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const SIDEBAR_WIDTH = 220;
const BREAKPOINT = 900;

export default function LayoutAdmin({ children, navigation }) {
  const windowWidth = Dimensions.get("window").width;
  const [isWide, setIsWide] = useState(windowWidth > BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(windowWidth > BREAKPOINT);
  const slide = useRef(new Animated.Value(windowWidth > BREAKPOINT ? 0 : -SIDEBAR_WIDTH)).current;

  useEffect(() => {
    const onChange = ({ window }) => {
      const wide = window.width > BREAKPOINT;
      setIsWide(wide);
      setSidebarOpen(wide ? true : false);
    };
    const sub = Dimensions.addEventListener("change", onChange);
    return () => {
      if (sub && sub.remove) sub.remove();
      else Dimensions.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: sidebarOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, slide]);

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
          <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerTouchable}>
            <MaterialIcons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>ADMIN PANEL</Text>
        </View>

        <View style={styles.bodyWrap}>
          {/* Sidebar */}
          <Animated.View
            pointerEvents={isWide ? "auto" : sidebarOpen ? "auto" : "none"}
            style={[
              styles.sidebar,
              isWide ? styles.sidebarInline : styles.sidebarOverlay,
              { transform: [{ translateX: slide }] },
            ]}
          >
            <ScrollView contentContainerStyle={styles.sidebarContent}>
              <TouchableOpacity onPress={() => nav("AdminDashboard")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav("ComplaintList")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Complaints</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav("AdminLogin")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Logout</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity onPress={() => nav("CitizenHome")} style={styles.sidebarLink}>
                <Text style={[styles.sidebarLinkText, { color: "#ffd66b" }]}>Back to Citizen</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Backdrop for overlay mode */}
          {!isWide && sidebarOpen && (
            <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
          )}

          {/* Main content area: vertical scroll only */}
          <View style={styles.mainArea}>
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.contentContainer}>
                {children}
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Admin Panel &copy; {new Date().getFullYear()} Citizen Complaint Portal
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
    height: 62,
    backgroundColor: "#11493f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    zIndex: 50,
  },
  hamburgerTouchable: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    zIndex: 60,
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
    width: SIDEBAR_WIDTH,
    backgroundColor: "#11493f",
    zIndex: 40,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  sidebarInline: { position: "relative" },
  sidebarOverlay: { position: "absolute", left: 0, top: 0, bottom: 0 },
  sidebarContent: { paddingTop: 20, paddingHorizontal: 12 },
  sidebarLink: { paddingVertical: 18, paddingHorizontal: 8 },
  sidebarLinkText: { color: "#fff", fontSize: 16 },
  divider: {
    height: 1,
    backgroundColor: "#ffd66b44",
    marginVertical: 14,
  },
  backdrop: {
    position: "absolute",
    top: 62,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 30,
  },
  mainArea: {
    flex: 1,
    padding: 18,
    zIndex: 10,
    flexDirection: "column",
    minHeight: 0,
    justifyContent: "flex-start",
  },
  contentContainer: { flexGrow: 1, paddingBottom: 6 },
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
  footerText: { color: "#11493f", fontStyle: "italic" },
});