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
} from "react-native";
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

  useEffect(() => {
    fetchAdmins();
    fetchAnnouncements();
  }, []);

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
    } catch {
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
  function startEdit(id, ann) {
    setEditingAnn({ id, title: ann.title, body: ann.body });
  }
  function stopEdit() {
    setEditingAnn({});
  }
  async function saveEdit() {
    try {
      const res = await fetch(`${API_URL}/api/announcements/${editingAnn.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingAnn.title, body: editingAnn.body }),
      });
      if (!res.ok) {
        throw new Error("Failed to update announcement.");
      }
      stopEdit();
      fetchAnnouncements();
      Alert.alert("Updated", "Announcement updated!");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }
  // Create new announcement
  async function createAnnouncement() {
    if (!newAnnTitle.trim()) { Alert.alert("Validation", "Title required."); return; }
    setCreatingAnn(true);
    try {
      const res = await fetch(`${API_URL}/api/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newAnnTitle, body: newAnnBody }),
      });
      if (!res.ok) {
        throw new Error("Failed to create announcement.");
      }
      setNewAnnTitle(""); setNewAnnBody("");
      fetchAnnouncements();
      Alert.alert("Added", "Announcement created.");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setCreatingAnn(false);
    }
  }

  return (
    <LayoutAdmin navigation={navigation}>
      <ScrollView contentContainerStyle={{ padding: 18, flexGrow: 1 }}>
        <Text style={styles.title}>Manage Admin Users</Text>
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
            <Text style={[styles.subtitle, { marginTop: 28, marginBottom: 8 }]}>Admin List</Text>
            {loadingAdmins ? <ActivityIndicator /> : admins.map(a =>
              <View key={a.id ?? a._id ?? a.username} style={styles.userRow}>
                <Text style={styles.userName}>{a.name} <Text style={styles.userMeta}>({a.username})</Text></Text>
                <Text style={styles.userMeta}>{a.email}</Text>
              </View>
            )}
          </View>

          {/* RIGHT: Announcements Management */}
          <View style={[styles.col, { flex: 2, marginLeft: isNarrow ? 0 : 18, marginTop: isNarrow ? 26 : 0 }]}>
            <Text style={styles.subtitle}>Edit Announcements for Home Screen</Text>
            {/* Add new announcement */}
            <View style={[styles.annCard, { marginBottom: 14 }]}>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={newAnnTitle}
                onChangeText={setNewAnnTitle}
              />
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                placeholder="Body"
                multiline
                value={newAnnBody}
                onChangeText={setNewAnnBody}
              />
              <TouchableOpacity style={[styles.button, { marginTop: 8 }, creatingAnn && { opacity: 0.6 }]}
                onPress={createAnnouncement}
                disabled={creatingAnn}
              >
                {creatingAnn ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Announcement</Text>}
              </TouchableOpacity>
            </View>
            {/* List and edit announcements */}
            {loadingAnns ? <ActivityIndicator /> : announcements.map(ann =>
              <View style={styles.annCard} key={ann.id ?? ann._id ?? ann.Title}>
                {editingAnn.id === (ann.id ?? ann._id ?? ann.Title) ? (
                  <>
                    <TextInput style={styles.input} value={editingAnn.title} onChangeText={t => setEditingAnn(e => ({ ...e, title: t }))} />
                    <TextInput style={[styles.input, { minHeight: 60 }]} multiline value={editingAnn.body} onChangeText={t => setEditingAnn(e => ({ ...e, body: t }))} />
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={saveEdit}>
                        <Text style={styles.actionBtnText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={stopEdit}>
                        <Text style={[styles.actionBtnText, { color: "#11493f" }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.annTitle}>{ann.title}</Text>
                    <Text style={styles.annBody}>{ann.body}</Text>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => startEdit(ann.id ?? ann._id ?? ann.Title, ann)}>
                        <Text style={styles.actionBtnText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
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
  actionBtnText: { fontWeight: "bold", color: "#197278", fontSize: 15 },
});