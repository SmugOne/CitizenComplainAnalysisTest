import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../../components/Layout";
import { API_URL } from "@env";

// MODAL ALERT
function ModalAlert({ visible, message }) {
  if (!visible) return null;

  return (
    <View style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: 999
    }}>
      <View style={{
        backgroundColor: '#fff',
        padding: 26,
        borderRadius: 12,
        alignItems: 'center',
        maxWidth: 320
      }}>
        <Text style={{ fontSize: 16, color: "#11493f", textAlign: "center" }}>{message}</Text>
      </View>
    </View>
  );
}

export default function AdminLoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPW, setShowPW] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ show: false, message: "" });

  const showModal = (message) => setModal({ show: true, message });
  const closeModal = () => setModal({ show: false, message: "" });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        showModal("Login successful!");
        setUsername("");
        setPassword("");
        setTimeout(() => {
          closeModal();
          navigation.navigate("AdminDashboard");
        }, 1000);
      } else {
        setError(data.message || "Incorrect username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server.");
    }
  };

  return (
    <Layout navigation={navigation}>
      <ModalAlert visible={modal.show} message={modal.message} />
      <View style={styles.card}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Enter your credentials to access the admin panel.</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <View style={styles.pwRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPW}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPW((s) => !s)}>
            <MaterialIcons name={showPW ? "visibility" : "visibility-off"} size={24} color="#197278" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={{ color: "red", marginTop: 4 }}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 10, color: "#888", fontSize: 12 }}>
          Demo login (optional if backend empty): admin / password123
        </Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 24, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: "#11493f", marginBottom: 10 },
  subtitle: { color: "#11493f", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ece6d5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: "100%",
    backgroundColor: "#f7f1de",
    fontSize: 15,
  },
  pwRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  eyeBtn: { marginLeft: 6, padding: 6 },
  loginBtn: {
    backgroundColor: "#11493f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginBtnText: { color: "#ffd66b", fontWeight: "700", fontSize: 16 },
});