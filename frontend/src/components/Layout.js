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

export default function Layout({ children, navigation }) {
  const windowWidth = Dimensions.get("window").width;
  const [isWide, setIsWide] = useState(windowWidth > BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(windowWidth > BREAKPOINT);
  const [notificationCount, setNotificationCount] = useState(1); // Example notification count
  const slide = useRef(new Animated.Value(windowWidth > BREAKPOINT ? 0 : -SIDEBAR_WIDTH)).current;

  useEffect(() => {
    const onChange = ({ window }) => { //hi 
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

  // Placeholder login/notification handlers
  const handleLogin = () => alert("Login button pressed! (User login functionality to be added)");
  const handleNotification = () => alert("You have notifications! (Notification feature to be implemented)");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerTouchable}>
            <MaterialIcons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>CITIZEN COMPLAINT PORTAL</Text>
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
              <TouchableOpacity onPress={() => nav("CitizenHome")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav("SubmitComplaint")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Submit Complaint</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav("TrackComplaint")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Track Complaint</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => nav("ComplaintStatus")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Complaint Status</Text>
              </TouchableOpacity> */}
              <TouchableOpacity onPress={() => nav("AboutScreen")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>About / FAQs</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity onPress={() => nav("AdminLogin")} style={styles.sidebarLink}>
                <Text style={[styles.sidebarLinkText, { color: "#ffd66b" }]}>Admin Login</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Backdrop for overlay mode */}
          {!isWide && sidebarOpen && (
            <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
          )}

          {/* Main content area */}
          <View style={styles.mainArea}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                I can do all things through Christ who strengthens me. - Philippians 4:13
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  iconButton: {
    marginLeft: 10,
    padding: 4,
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "red",
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
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