import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Image, Switch, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import Layout from "../../components/Layout";
import { API_URL } from "@env";

const defaultCategories = [
  {label: "Select Category", value: ""},
  {label: "Garbage Collection", value: "DENR"},
  {label: "Road Damage", value: "DPWH"},
  {label: "Water Services", value: "DENR"},
  {label: "Electricity Services", value: "DOE"},
  {label: "Education Services", value: "DEPED"},
  {label: "Corruption", value: "OMBUDSMAN"},
  {label: "Others", value: "NA"},
];

export default function SubmitComplaintScreen({ navigation }) {
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [complaint, setComplaint] = useState("");
  const [category, setCategory] = useState(defaultCategories[0]);
  const [categories, setCategories] = useState(defaultCategories);
  const [location, setLocation] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

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

  //Required fields before submit button can be pressed
  const pickImage = async () => {
    setImageLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    // For SDK 49+, result.assets; for older, result.uri
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    } else if (!result.canceled && result.uri) {
      setImage(result.uri);
    }
    setImageLoading(false);
  };

  const handleRemoveImage = () => setImage(null);

  const canSubmit =
    complaint.trim() !== "" &&
    category.value.trim() !== "" &&
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
        category: category.value,
        location: location,
      }),
    });
    const data = await response.json();
    alert(`${data.message}\nComplaint ID: ${data.id}`); //See Public_Complaint_Program.py at return jsonify

    //Reset form after success(?)
    setName("");
    setComplaint("");
    setCategory(categories[0]);
    setLocation("");
    setAnonymous(false);
    setImage(null);
  } catch (err) {
    console.error("Error submitting complaint:", err);
    alert("Failed to submit complaint. Please try again.");
  }
};
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
              value={category.value}
              onChange={(e) =>
                setCategory(categories.find((cat) => cat.value === e.target.value))
              }
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          ) : (
            <Picker
              selectedValue={category.value}
              style={styles.picker}
              onValueChange={(value) =>
                setCategory(categories.find((cat) => cat.value === value))
              }
            >
              {categories.map((cat) => (
                <Picker.Item label={cat.label} value={cat.value} key={cat.value} />
              ))}
            </Picker>
          )}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={{ flex: 1, fontSize: 12 }}>{location ? location : "No location set"}</Text>
          <TouchableOpacity onPress={handleGetLocation} style={styles.locBtn}>
            {locLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.locBtnText}>Get Location</Text>}
          </TouchableOpacity>
        </View>
        {/* IMAGE UPLOAD SECTION */}
        <View style={styles.row}>
          <Text style={styles.label}>Attach Image:</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
            <Text style={styles.imageBtnText}>{imageLoading ? "Loading..." : "Pick Image"}</Text>
          </TouchableOpacity>
          {image && (
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removeImageBtn}>
              <Text style={styles.removeImageBtnText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
        {image && (
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Image source={{ uri: image }} style={{ width: 120, height: 120, borderRadius: 10 }} />
          </View>
        )}
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
  imageBtn: {
    marginLeft: 10,
    backgroundColor: "#197278",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  imageBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  removeImageBtn: {
    marginLeft: 10,
    backgroundColor: "#c93a3a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeImageBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});