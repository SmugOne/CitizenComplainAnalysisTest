import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

const ComplaintFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [RawComplaint, setComplaint] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(null);
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    if (anonymous) {
      setName('Anonymous');
    } else {
      setName('');
    }
  }, [anonymous]);

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Permission to access location is required.");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
  };

  const handleSubmit = async () => {
    const finalName = anonymous || !name.trim() ? 'Anonymous' : name;

    if (!RawComplaint.trim()) {
      Alert.alert('Complaint Missing');
      return;
    }

    const FrontEndData = {
      name: finalName,
      complaint: RawComplaint,
      location: location ?? null,
    };

    try {
      const response = await fetch('http://172.17.24.153:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(FrontEndData),
      });

      if (response.ok) {
        Alert.alert('Complaint Submitted');
        setName('');
        setComplaint('');
        setCategory('');
        setLocation(null);
        setAnonymous(false);
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Failed to submit complaint.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint Form</Text>

      {!anonymous && (
        <TextInput
          placeholder="Name (optional)"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={anonymous}
          onValueChange={setAnonymous}
          color={anonymous ? '#4630EB' : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.label}>Send as Anonymous</Text>
      </View>

      <TextInput
        placeholder="Add Complaint"
        value={RawComplaint}
        onChangeText={setComplaint}
        multiline
        style={[styles.input, { height: 100 }]}
      />

      <Text style={styles.label}>Category:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Garbage Collection" value="DENR" />
          <Picker.Item label="Road Damage" value="DPWH" />
          <Picker.Item label="Water Supply" value="DENR" />
          <Picker.Item label="Electricity Issue" value="DOE" />
          <Picker.Item label="Others" value="" />
        </Picker>
      </View>

      <View style={styles.buttonSpacing}>
        <Button title="Get Location" onPress={handleGetLocation} />
      </View>

      {location && location.latitude && location.longitude && (
        <Text style={styles.locationText}>
          Location: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </Text>
      )}

      <View style={styles.buttonSpacing}>
        <Button title="Submit Complaint" onPress={handleSubmit} />
      </View>

      <View style={styles.buttonSpacing}>
        <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonSpacing: {
    marginTop: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  locationText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default ComplaintFormScreen;