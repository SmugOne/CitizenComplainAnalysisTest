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
const FOOTER_HEIGHT = 50;

export default function LayoutAdmin({ children, navigation, noScroll = false }) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const computedSidebarWidth =
    windowWidth > BREAKPOINT ? BASE_SIDEBAR_WIDTH : Math.max(160, Math.floor(windowWidth * 0.68));

  const [isWide, setIsWide] = useState(windowWidth > BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(windowWidth > BREAKPOINT);
  const slide = useRef(new Animated.Value(sidebarOpen ? 0 : -computedSidebarWidth)).current;

  useEffect(() => {
    const wide = windowWidth > BREAKPOINT;
    setIsWide(wide);
    setSidebarOpen(wide);
  }, [windowWidth]);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: sidebarOpen ? 0 : -computedSidebarWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, computedSidebarWidth]);

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
            <ScrollView 
              contentContainerStyle={styles.sidebarContent}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity onPress={() => nav("AdminDashboard")} style={styles.sidebarLink}>
                <Text style={styles.sidebarLinkText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => nav("ManageAdminUser")} style={styles.sidebarLink}>
              <Text style={styles.sidebarLinkText}>Management</Text>
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
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
          )}

          {/* Main Content Area */}
          <View style={styles.mainArea}>
            {noScroll ? (
              // For screens that manage their own scrolling (like Statistics with charts)
              <View style={styles.noScrollWrapper}>
                {children}
              </View>
            ) : (
              // Default: Layout handles scrolling for most screens
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
              >
                {children}
              </ScrollView>
            )}

            {/* Footer */}
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
    backgroundColor: "#f7f1de",
    ...(Platform.OS === "web" ? { minHeight: "100vh" } : {}),
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f1de",
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: "#11493f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    zIndex: 60,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
      },
    }),
  },
  hamburgerTouchable: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#ffd66b",
    fontWeight: "700",
    fontSize: 18,
  },
  bodyWrap: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
    overflow: "hidden",
  },
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
  sidebarInline: {
    position: "relative",
  },
  sidebarOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  sidebarContent: {
    paddingTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  sidebarLink: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  sidebarLinkText: {
    color: "#fff",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#ffd66b44",
    marginVertical: 14,
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 40,
  },
  mainArea: {
    flex: 1,
    zIndex: 10,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: FOOTER_HEIGHT + 30,
  },
  noScrollWrapper: {
    flex: 1,
  },
  footer: {
    backgroundColor: "#fde2a6",
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    minHeight: FOOTER_HEIGHT,
    ...Platform.select({
      web: {
        position: 'sticky',
        bottom: 0,
      },
    }),
  },
  footerText: {
    color: "#11493f",
    fontStyle: "italic",
    textAlign: "center",
    fontSize: 13,
  },
});