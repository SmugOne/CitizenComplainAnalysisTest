import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; 
import LayoutAdmin from "../../../components/LayoutAdmin";
import { API_URL } from "@env";

// Responsive helper
function useIsNarrowScreen() {
  const { width } = useWindowDimensions();
  return width < 900;
}

export default function ManageAdminUserScreen({ navigation }) {
  const isNarrow = useIsNarrowScreen();

  // Admin form state
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Data
  const [admins, setAdmins] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [loadingAnns, setLoadingAnns] = useState(false);
  const [creating, setCreating] = useState(false);

  // Announcement edit state
  const [editingAnn, setEditingAnn] = useState({});
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnBody, setNewAnnBody] = useState("");
  const [creatingAnn, setCreatingAnn] = useState(false);
  const [selectedSpaces, setSelectedSpaces] = useState({ space: 1 });

  useEffect(() => {
    fetchAdmins();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0 && selectedSpaces.space === null) {
      const firstSpace = announcements[0].space;
      setSelectedSpaces({ space: firstSpace });
      setEditingAnn({ title: announcements[0].title, body: announcements[0].body });
    }
  }, [announcements]);

  async function fetchAdmins() {
    setLoadingAdmins(true);
    try {
      const res = await fetch(`${API_URL}/api/admins`);
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch {
      setAdmins([]);
      Alert.alert("Error", "Failed to load admin user list.");
    } finally {
      setLoadingAdmins(false);
    }
  }

  async function fetchAnnouncements() {
    setLoadingAnns(true);
    try {
      const res = await fetch(`${API_URL}/api/announcements`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
      Alert.alert("Error", "Failed to load announcements.");
    } finally {
      setLoadingAnns(false);
    }
  }

  // Create new admin
  async function createAdmin() {
    if (!username.trim() || !password.trim() || !name.trim()) {
      Alert.alert("Validation", "Username, password and name are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name, email }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Status ${res.status}`);
      }
      setUsername(""); setPassword(""); setName(""); setEmail("");
      await fetchAdmins();
      Alert.alert("Admin created", "Admin account created successfully.");
    } catch (err) {
      Alert.alert("Error", err.message || String(err));
    } finally {
      setCreating(false);
    }
  }

  // Announcement Edit helpers
  async function saveEdit() {
    if (!editingAnn.title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Space: selectedSpaces.space, 
          Title: editingAnn.title,
          Body: editingAnn.body,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update announcement.");
      }

      await fetchAnnouncements();

      // Show modal instead of Alert
      setModalVisible(true);

    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  <Modal
    transparent={true}
    visible={modalVisible}
    animationType="fade"
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    }}>
      <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>
          Announcements successfully updated!
        </Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(false)} 
          style={{ backgroundColor: '#197278', padding: 8, borderRadius: 6 }}
        >
          <Text style={{ color: '#fff' }}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

  return (
    <LayoutAdmin navigation={navigation}>
      <ScrollView contentContainerStyle={{ padding: 18, flexGrow: 1 }}>
        <Text style={styles.title}>Management</Text>
        <View style={[styles.sectionRow, { flexDirection: isNarrow ? "column" : "row" }]}>
          {/* LEFT: Admin Form + List */}
          <View style={[styles.col, { flex: 1, marginRight: isNarrow ? 0 : 18 }]}>
            <Text style={styles.subtitle}>Create Admin</Text>
            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
            <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TouchableOpacity onPress={createAdmin} style={[styles.button, creating && { opacity: 0.6 }]} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Admin</Text>}
            </TouchableOpacity>

            {/* Admin List */}
            <Text style={[styles.subtitle, { marginTop: 28, marginBottom: 8 }]}>Admin List</Text>
            {loadingAdmins ? (
              <ActivityIndicator />
            ) : (
              admins.map(a => (
                <View key={a.id ?? a._id ?? a.username} style={styles.userRow}>
                  <Text style={styles.userName}>
                    {a.name} <Text style={styles.userMeta}>({a.username})</Text>
                  </Text>
                  <Text style={styles.userMeta}>{a.email}</Text>
                </View>
              ))
            )}
          </View> 

          {/* RIGHT: ANNOUNCEMENTS */}
          <View style={[styles.col, { flex: 2, marginLeft: isNarrow ? 0 : 18, marginTop: isNarrow ? 26 : 0 }]}>
            <Text style={styles.subtitle}>Edit Announcements</Text>

            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Select Space</Text>

            <Picker
              selectedValue={selectedSpaces.space}
              onValueChange={(val) => {
                const intVal = parseInt(val, 10);
                setSelectedSpaces({ space: intVal });
                const ann = announcements.find(a => a.space === intVal);
                if (ann) {
                  setEditingAnn({ title: ann.title, body: ann.body });
                } else {
                  setEditingAnn({ title: "", body: "" });
                }
              }}
            >
              {announcements.map(a => (
                <Picker.Item key={a.space} label={`Space ${a.space}`} value={a.space} />
              ))}
            </Picker>

            <View style={[styles.annCard, { marginTop: 14 }]}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={editingAnn.title}
                onChangeText={(t) => setEditingAnn(e => ({ ...e, title: t }))}
              />

              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Body</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                placeholder="Body"
                multiline
                value={editingAnn.body}
                onChangeText={(t) => setEditingAnn(e => ({ ...e, body: t }))}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={saveEdit}>
                  <Text style={styles.actionBtnText}>Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => setEditingAnn({ title: "", body: "" })}
                >
                  <Text style={[styles.actionBtnText, { color: "#11493f" }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Modal for announcement update */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Announcement Updated</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: '#197278', padding: 8, borderRadius: 6 }}>
                <Text style={{ color: '#fff' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </LayoutAdmin>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "bold", fontSize: 26, color: "#11493f", marginBottom: 18, textAlign: "center" },
  sectionRow: { width: "100%", justifyContent: "center", alignItems: "flex-start" },
  col: { backgroundColor: "#fffbe8", borderRadius: 12, padding: 16, marginBottom: 12 },
  subtitle: { fontWeight: "bold", fontSize: 18, color: "#11493f", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff", marginBottom: 8 },
  button: { backgroundColor: "#197278", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 2 },
  buttonText: { color: "#ffd66b", fontWeight: "bold", fontSize: 16 },
  userRow: { marginBottom: 8 },
  userName: { fontWeight: "bold", fontSize: 15, color: "#11493f" },
  userMeta: { color: "#555", fontSize: 13 },
  annCard: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 6, elevation: 2 },
  annTitle: { fontWeight: "bold", fontSize: 15, color: "#197278", marginBottom: 6 },
  annBody: { color: "#444", marginBottom: 8 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  actionBtn: { backgroundColor: "#ffd66b", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 18, marginRight: 8 },
  saveBtn: { backgroundColor: "#197278" },
  cancelBtn: { backgroundColor: "#fde2a6" },
  actionBtnText: { fontWeight: "bold", color: "#ffffffff", fontSize: 15 },
});