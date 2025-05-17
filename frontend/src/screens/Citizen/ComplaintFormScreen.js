import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import * as Location from 'expo-location';
import { API_URL } from '@env';
import { Picker } from '@react-native-picker/picker';

const ComplaintFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [RawComplaint, setComplaint] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(null);
  const [anonymous, setAnonymous] = useState(false);

  //Set default name to Anonymous or vice versa.
  useEffect(() => {
    if (anonymous) {
      setName('Anonymous');
    } 
    else {
      setName('');
    }
  }, [anonymous]);

  //Location:
  const handleGetLocation = async () => {
    var { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Permission to access location is required.");
      return;
    }

    //Get location
    var currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
  };

  //Submit Complaint
  const handleSubmit = async () => {
    // if anonymous true, set name to Anonymous. Else keep name
    let finalName;
    if (anonymous || !name.trim()) {
      finalName = 'Anonymous';
    } 
    else {
      finalName = name;
    }

    //If no complaints inputted
    if (!RawComplaint.trim()) {
      Alert.alert('Complaint Missing');
      return;
    }

    //Sets FrontEndData to be sent to the backend
    const FrontEndData = {
      name: finalName,
      complaint: RawComplaint,
      category: category && null, //Update in future use with agencies
      location: location ?? null,
    };

    //Sends data (FrontEndData) to backend
    var response = "";
      response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(FrontEndData),
      });

    //Adds error
    if (response.ok) {
      Alert.alert('Complaint Submitted', '', [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setComplaint('');
            setCategory('');
            setLocation(null);
            setAnonymous(false);
            navigation.navigate('Home');
          },
        },
      ]);
    } else {
      const errorText = await response.text();
      // debug: Server error response
      console.error('Server error on response:', errorText);
      Alert.alert(`Failed to submit complaint: ${errorText}`);
    }
  };


  //HTML:
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
          <Picker.Item label="Water Services" value="DENR" />
          <Picker.Item label="Electricity Services" value="DOE" />
          <Picker.Item label="Education Services" value="DepEd" />
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
