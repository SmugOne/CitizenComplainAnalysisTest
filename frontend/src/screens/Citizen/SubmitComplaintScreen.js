import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Picker, Switch, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import Layout from "../../components/Layout";
import { API_URL } from "@env";

const defaultCategories = [
  "Infrastructure",
  "Public Services",
  "Safety & Security",
  "Environment",
  "Administrative Issues",
  "Community Concerns",
  "Other",
];

export default function SubmitComplaintScreen({ navigation }) {
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [complaint, setComplaint] = useState("");
  const [category, setCategory] = useState(defaultCategories[0]);
  const [categories, setCategories] = useState(defaultCategories);
  const [location, setLocation] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  const handleGetLocation = async () => {
    setLocLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permission denied");
        setLocLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(`Lat: ${loc.coords.latitude}, Long: ${loc.coords.longitude}`);
    } catch (e) {
      setLocation("Could not get location");
    }
    setLocLoading(false);
  };

  const handleAddCategory = () => {
    const newCat = prompt("Enter new category:");
    if (newCat && !categories.includes(newCat)) setCategories([...categories, newCat]);
  };

  const canSubmit =
    complaint.trim() !== "" &&
    category.trim() !== "" &&
    location.trim() !== "" &&
    (anonymous || name.trim() !== "");

  //Submit complaint
  const handleSubmit = async () => {
  if (!canSubmit) return;
  try {
    const response = await fetch(`${API_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: anonymous ? "Anonymous" : name,
        complaint: complaint,
        category: category,
        location: location,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    alert(`${data.message}\nComplaint ID: ${data.id}\nName: ${anonymous ? "Anonymous" : name}\nComplaint: ${complaint}\nCategory: ${category}\nLocation: ${location}`   
    );

    //Reset form after success(?)
    setName("");
    setComplaint("");
    setCategory(categories[0]);
    setLocation("");
    setAnonymous(false);
  } catch (err) {
    console.error("Error submitting complaint:", err);
    alert("Failed to submit complaint. Please try again.");
  }
};

  return (
    <Layout navigation={navigation}>
      <View style={styles.card}>
        <Text style={styles.title}>Submit a Complaint</Text>
        <Text style={styles.subtitle}>
          Fill in the form below to lodge your complaint. Anonymous option is available.
        </Text>
      </View>
      <View style={styles.formCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Anonymous?</Text>
          <Switch value={anonymous} onValueChange={setAnonymous} />
        </View>
        {!anonymous && (
          <TextInput
            style={styles.input}
            placeholder="Name (required if not anonymous)"
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Your Complaint"
          value={complaint}
          onChangeText={setComplaint}
          multiline
        />
        <View style={styles.row}>
          <Text style={styles.label}>Category:</Text>
          {Platform.OS === "web" ? (
            <select
              style={styles.select}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          ) : (
            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={setCategory}
            >
              {categories.map(cat => (
                <Picker.Item label={cat} value={cat} key={cat} />
              ))}
            </Picker>
          )}
          <TouchableOpacity onPress={handleAddCategory} style={styles.addCatBtn}>
            <Text style={styles.addCatBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={{ flex: 1, fontSize: 12 }}>{location ? location : "No location set"}</Text>
          <TouchableOpacity onPress={handleGetLocation} style={styles.locBtn}>
            {locLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.locBtnText}>Get Location</Text>}
          </TouchableOpacity>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.submitBtn, !canSubmit && { opacity: 0.5 }]} onPress={handleSubmit} disabled={!canSubmit}>
            <Text style={styles.submitBtnText}>Submit Complaint</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("CitizenHome")}>
            <Text style={styles.backBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fbf3df", padding: 22, borderRadius: 12, marginBottom: 18 },
  title: { fontSize: 28, textAlign: "center", fontWeight: "800", color: "#11493f" },
  subtitle: { marginTop: 8, textAlign: "center", color: "#11493f" },
  formCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ece6d5",
  },
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
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  label: { fontWeight: "700", marginRight: 8, color: "#11493f" },
  select: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ece6d5",
    backgroundColor: "#f7f1de",
    fontSize: 15,
  },
  picker: { flex: 1, height: 40 },
  addCatBtn: {
    marginLeft: 10,
    backgroundColor: "#197278",
    borderRadius: 14,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  addCatBtnText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  locBtn: {
    backgroundColor: "#197278",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 10,
  },
  locBtnText: { color: "#fff", fontWeight: "700" },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  submitBtn: {
    backgroundColor: "#11493f",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitBtnText: { color: "#ffd66b", fontWeight: "700", fontSize: 16 },
  backBtn: {
    backgroundColor: "#ffd66b",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  backBtnText: { color: "#11493f", fontWeight: "700", fontSize: 16 },
});