import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Image, Switch, ActivityIndicator, Modal } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import Layout from "../../components/Layout";
import { API_URL } from "@env";

// MODAL ALERT
function ModalAlert({ visible, message, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
      }}>
        <View style={{
          backgroundColor: '#fff', padding: 26, borderRadius: 12, alignItems: 'center', maxWidth: 320
        }}>
          <Text style={{ fontSize: 16, color: "#11493f", marginBottom: 18, textAlign: "center" }}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor: "#11493f", borderRadius: 8, paddingHorizontal: 28, paddingVertical: 10 }}>
            <Text style={{ color: "#ffd66b", fontWeight: "700", fontSize: 17 }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const defaultCategories = [
  {label: "Select Category", value: ""},
  {label: "Garbage Collection", value: "DENR"},
  {label: "Road Damage", value: "TRAFFIC MANAGEMENT"},
  {label: "Water Services", value: "DENR"},
  {label: "Electricity Services", value: "DOE"},
  {label: "Education Services", value: "DEPED"},
  {label: "Corruption", value: "OMBUDSMAN"},
  {label: "Government Employee Issue", value: "OMBUDSMAN"},
  {label: "Transport Issue", value: "DOTR"},
  {label: "Others", value: ""},
];

export default function SubmitComplaintScreen({ navigation }) {
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [complaint, setComplaint] = useState("");
  const [category, setCategory] = useState(defaultCategories[0]);
  const [location, setLocation] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [contactNo, setContactNo] = useState("");

  // Modal Alert handling
  const [modal, setModal] = useState({ show: false, message: "" });

  //Random 5-letter password generator
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 5; i++) {
      pass = pass + chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const showModal = (message) => setModal({ show: true, message });
  const closeModal = () => setModal({ show: false, message: "" });

  const handleGetLocation = async () => {
    setLocLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permission denied");
        setLocLoading(false);
        showModal("Location permission denied.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(`Lat: ${loc.coords.latitude}, Long: ${loc.coords.longitude}`);
    } 
    catch (e) {
      setLocation("Could not get location");
      showModal("Could not get location.");
    }
    setLocLoading(false);
  };

  //Image picker
  const pickImage = async () => {
    setImageLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled) {
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setImage(uri);
      }
    } 
    catch (error) {
      console.error("Error picking image:", error);
      showModal("Error picking image. Please try again.");
    }
    setImageLoading(false);
  };

  const handleRemoveImage = () => setImage(null);

  //Form validation (Can only submit if all fields are filled)
  const canSubmit =
    complaint.trim() !== "" &&
    (anonymous || name.trim() !== "");

  //Submit complaint & image to backend
  const handleSubmit = async () => {
    if (!canSubmit) return;
    let imageId = null;
    let imageUrl = null;
    const generatedPassword = generatePassword();

    //Upload image to backend
    if (image) {
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: image,
          name: "complaint_image.jpg",
          type: "image/jpeg",
        });

        const uploadResponse = await fetch(`${API_URL}/api/uploadImage`, {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        imageId = uploadData.imageId;
        imageUrl = uploadData.imageUrl;
      } 
      catch (err) {
        console.error("Error uploading image:", err);
        showModal("Failed to upload image. Please try again.");
        return;
      }
    }

    //Submit complaint data to backend
    try {
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: anonymous ? "Anonymous" : name,
          complaint: complaint,
          category: category.value,
          location: location,
          contactNo: contactNo,
          imageID: imageId,
          imageUrl: imageUrl,
          status: "UNSOLVED",
          password: generatedPassword,
        }),
      });

      //Alerts user after submitting complaint
      const data = await response.json();
      showModal(
        `Complaint submitted!\n\nPlease take a screenshot or picture of the COMPLAINT ID and PASSWORD to track its status.\n\n` +
        `COMPLAINT ID: ${data.ID}\n` +
        `PASSWORD: ${generatedPassword}`
      );

      //Reset form after success(?)
      setName("");
      setComplaint("");
      setCategory(defaultCategories[0]);
      setLocation("");
      setContactNo("");
      setAnonymous(false);
      setImage(null);
    } 
    catch (err) {
      console.error("Error submitting complaint:", err);
      showModal("Failed to submit complaint. Please try again.");
    }
  };

  return (
    <Layout navigation={navigation}>
      <ModalAlert visible={modal.show} message={modal.message} onClose={closeModal} />
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
          <Text style={styles.label}>Category:    </Text>
          {Platform.OS === "web" ? (
            <select
              style={styles.select}
              value={category.value}
              onChange={(e) =>
                setCategory(defaultCategories.find((cat) => cat.value === e.target.value))
              }
            >
              {defaultCategories.map((cat) => (
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
                setCategory(defaultCategories.find((cat) => cat.value === value))
              }
            >
              {defaultCategories.map((cat) => (
                <Picker.Item label={cat.label} value={cat.value} key={cat.value} />
              ))}
            </Picker>
          )}
        </View>

        {/* CONTACT NUMBER INPUT */}
        <View style={styles.row}>
          <Text style={styles.label}>Contact No:</Text>
            <TextInput
              style={[styles.input, { flex: 1, height: 40 }]}
              placeholder="Contact Number (optional)"
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
              value={contactNo}
              maxLength={11} 
              onChangeText={(text) => {
                //Keep only digits
                const numericText = text.replace(/[^0-9]/g, "");
                setContactNo(numericText);
              }}
            />
        </View>

        {/* LOCATION INPUT */}
        <View style={styles.row}>
          <Text style={styles.label}>Location:    </Text>
          <TextInput
            style={[styles.input, { flex: 1, height: 40 }]}
            placeholder="Enter location (optional)"
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity onPress={handleGetLocation} style={styles.locBtn}>
            {locLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.locBtnText}>Get Location</Text>
            )}
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
};
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