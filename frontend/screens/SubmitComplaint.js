import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SubmitComplaint({ onBack }) {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Garbage', value: 'Garbage' },
    { label: 'Roads', value: 'Roads' },
    { label: 'Crime', value: 'Crime' },
    { label: 'Corruption', value: 'Corruption' },
    { label: 'Abuse', value: 'Abuse' },
  ]);

  const assignUrgency = (category) => {
    switch (category) {
      case 'Garbage':
        return 'Low';
      case 'Roads':
        return 'Urgent';
      case 'Crime':
      case 'Corruption':
      case 'Abuse':
        return 'Emergency';
      default:
        return 'Low';
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
    if (reverseGeocode.length > 0) {
      const place = reverseGeocode[0];
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: `${place.name || ''}, ${place.street || ''}, ${place.subregion || ''}, ${place.region || ''}, ${place.country || ''}`,
      });
    } else {
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: 'Address not found',
      });
    }
  };

  const handleSubmit = async () => {
    if (!details || !categoryValue) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const complaint = {
      name: isAnonymous ? 'Anonymous' : name || 'Anonymous',
      details,
      category: categoryValue,
      urgency: assignUrgency(categoryValue),
      image,
      location,
      date: new Date().toISOString(),
      status: 'Pending',
    };

    const storedComplaints = await AsyncStorage.getItem('complaints');
    const complaints = storedComplaints ? JSON.parse(storedComplaints) : [];
    complaints.push(complaint);
    await AsyncStorage.setItem('complaints', JSON.stringify(complaints));
    Alert.alert('Submitted', 'Complaint submitted successfully.');
    setName('');
    setDetails('');
    setCategoryValue(null);
    setImage(null);
    setLocation(null);
    setIsAnonymous(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Submit Complaint</Text>
      <Text style={styles.label}>Complainant Name (Optional if anonymous):</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Complaint Details (Required):</Text>
      <TextInput value={details} onChangeText={setDetails} style={styles.textArea} multiline numberOfLines={4} />

      <Text style={styles.label}>Category:</Text>
      <DropDownPicker
        open={categoryOpen}
        value={categoryValue}
        items={categoryItems}
        setOpen={setCategoryOpen}
        setValue={setCategoryValue}
        setItems={setCategoryItems}
        style={styles.dropdown}
      />

      <TouchableOpacity style={styles.button} onPress={handlePickImage}>
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGetLocation}>
        <Text style={styles.buttonText}>Get Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      {location && (
        <View style={{ marginTop: 10 }}>
          <Text>Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
          <Text>Address: {location.address}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F0F8FF', flex: 1 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 12, color: '#0044cc' },
  label: { fontSize: 16, marginVertical: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
  textArea: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, height: 100 },
  dropdown: { marginBottom: 12, zIndex: 1000 },
  button: {
    backgroundColor: '#0044cc',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  image: { width: '100%', height: 200, marginTop: 10, borderRadius: 8 },
});