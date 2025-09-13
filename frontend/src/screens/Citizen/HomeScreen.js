import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { icon: 'car-sport', label: 'Roads & Infrastructure' },
  { icon: 'trash', label: 'Waste Management' },
  { icon: 'warning', label: 'Traffic & Safety' },
];

const stats = {
  total: 1245,
  resolved: 980,
  inProgress: 265,
};

const isWide = () => Dimensions.get('window').width > 800;

const HomeScreen = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(isWide());
  const [complaintId, setComplaintId] = useState('');

  useEffect(() => {
    const handler = () => {
      // when window resizes, show sidebar on wide screens, hide on small screens
      setSidebarVisible(isWide());
    };
    Dimensions.addEventListener && Dimensions.addEventListener('change', handler);
    return () => Dimensions.removeEventListener && Dimensions.removeEventListener('change', handler);
  }, []);

  const handleCategoryPress = (label) => {
    navigation.navigate('Complaint Form', { category: label });
  };

  const renderSidebarLinks = () => (
    <>
      <TouchableOpacity style={styles.sidebarLink} onPress={() => { setSidebarVisible(false); navigation.navigate('Home'); }}>
        <Text style={styles.sidebarText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sidebarLink} onPress={() => { setSidebarVisible(false); navigation.navigate('Complaint Form'); }}>
        <Text style={styles.sidebarText}>Submit Complaint</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sidebarLink} onPress={() => { setSidebarVisible(false); navigation.navigate('Complaint Status'); }}>
        <Text style={styles.sidebarText}>Track Complaint</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sidebarLink} onPress={() => { setSidebarVisible(false); navigation.navigate('Complaint History'); }}>
        <Text style={styles.sidebarText}>Complaint History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sidebarLink} onPress={() => { setSidebarVisible(false); navigation.navigate('About'); }}>
        <Text style={styles.sidebarText}>About / FAQs</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.wrapper}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityLabel="Toggle menu"
          style={styles.hamburger}
          onPress={() => setSidebarVisible(v => !v)}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <Ionicons name="chatbubble-ellipses" size={32} color="#ffe066" style={{ marginRight: 10 }} />
          <Text style={styles.portalTitle}>CITIZEN COMPLAINT PORTAL</Text>
        </View>

        <View style={styles.topRight}>
          <Ionicons name="notifications" size={22} color="#fff" style={{ marginRight: 12 }} />
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Admin Login')}> 
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.flexRow}>
        {/* Sidebar for wide screens */}
        {isWide() && (
          <View style={styles.sidebar}>
            {renderSidebarLinks()}
          </View>
        )}

        {/* Main Content */}
        <View style={styles.contentWrapper}>
          <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.headerSection}>
              <Text style={styles.mainHeading}>Report a Complaint</Text>
              <Text style={styles.subText}>Your voice matters. Report issues and concerns in your community.</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Complaint Form')}> 
                  <Text style={styles.primaryBtnText}>Report a Complaint</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Complaint Status')}> 
                  <Text style={styles.secondaryBtnText}>Track Your Complaint</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.flexRowContent}>
              <View style={styles.quickCats}>
                <Text style={styles.sectionHeading}>Quick Complaint Categories</Text>
                <View style={styles.catRow}>
                  {categories.map((cat, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.catCard}
                      onPress={() => handleCategoryPress(cat.label)}
                    >
                      <Ionicons name={cat.icon} size={40} color="#184c44" style={{ marginBottom: 8 }} />
                      <Text style={styles.catLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionHeading}>Track Your Complaint</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Complaint ID"
                  placeholderTextColor="#aaa"
                  value={complaintId}
                  onChangeText={setComplaintId}
                />
              </View>

              <View style={styles.statsBox}>
                <Text style={styles.sectionHeading}>Complaint Statistics</Text>
                <Text style={styles.statsLabel}>Total Complaints</Text>
                <Text style={styles.statsNumber}>{stats.total.toLocaleString()}</Text>
                <Text style={styles.statsLabel}>Complaints Resolved</Text>
                <Text style={styles.statsNumber}>{stats.resolved.toLocaleString()}</Text>
                <Text style={styles.statsLabel}>Complaints in Progress</Text>
                <Text style={styles.statsNumber}>{stats.inProgress.toLocaleString()}</Text>
              </View>
            </View>

            <Text style={styles.footerVerse}>
              I can do all things through Christ who strengthens me. - Philippians 4:13
            </Text>

          </ScrollView>
        </View>
      </View>

      {/* Mobile sidebar overlay */}
      {!isWide() && sidebarVisible && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.sidebarMobile}>
            {renderSidebarLinks()}
          </View>
        </View>
      )}

    </View>
  );
};

const darkGreen = '#184c44';
const softYellow = '#ffe066';
const lightBg = '#f8f6e3';

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: lightBg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkGreen,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  hamburger: {
    padding: 6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  portalTitle: {
    color: softYellow,
    fontWeight: 'bold',
    fontSize: 18,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: softYellow,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loginBtnText: {
    color: darkGreen,
    fontWeight: 'bold',
    fontSize: 14,
  },
  flexRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  sidebar: {
    minWidth: 200,
    maxWidth: 260,
    backgroundColor: darkGreen,
    paddingTop: 26,
    paddingHorizontal: 12,
    height: '100%',
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: darkGreen,
    paddingTop: 60,
    paddingHorizontal: 12,
    zIndex: 30,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sidebarLink: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  sidebarText: {
    color: '#fff',
    fontSize: 16,
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 18,
    backgroundColor: lightBg,
  },
  headerSection: {
    backgroundColor: '#fdf6e4',
    borderRadius: 14,
    padding: 18,
    marginBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 3,
  },
  mainHeading: {
    fontSize: 36,
    fontWeight: '900',
    color: darkGreen,
    marginBottom: 6,
    textAlign: 'center',
  },
  subText: {
    color: '#184c44',
    fontSize: 17,
    marginBottom: 18,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    justifyContent: 'center',
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: darkGreen,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryBtn: {
    borderColor: darkGreen,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: 'transparent',
    minWidth: 180,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: darkGreen,
    fontWeight: 'bold',
    fontSize: 18,
  },
  flexRowContent: {
    flexDirection: isWide() ? 'row' : 'column',
    gap: 22,
    marginBottom: 20,
    width: '100%',
  },
  quickCats: {
    flex: 2,
    marginRight: isWide() ? 28 : 0,
    marginBottom: isWide() ? 0 : 18,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: darkGreen,
    marginBottom: 10,
    marginTop: 8,
  },
  catRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
    justifyContent: isWide() ? 'flex-start' : 'center',
  },
  catCard: {
    backgroundColor: '#f7f3e8',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 110,
    minHeight: 110,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 2,
  },
  catLabel: {
    fontSize: 15,
    color: darkGreen,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 7,
    backgroundColor: '#fff',
  },
  statsBox: {
    flex: 1,
    backgroundColor: '#e7efe3',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    minWidth: 210,
    marginTop: isWide() ? 0 : 18,
  },
  statsLabel: {
    fontSize: 15,
    color: '#184c44',
    marginTop: 12,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: darkGreen,
    marginBottom: 4,
  },
  footerVerse: {
    backgroundColor: '#ffe599',
    textAlign: 'center',
    color: '#184c44',
    fontStyle: 'italic',
    fontSize: 15,
    padding: 10,
    borderRadius: 8,
    marginTop: 18,
  },
});

export default HomeScreen;