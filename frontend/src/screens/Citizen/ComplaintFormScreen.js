import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';

const ComplaintFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [RawComplaint, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [anonymous, setAnonymous] = useState(false);

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Permission to access location is required.");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
  };


  //Submit function:
  const handleSubmit = async () => {
    const finalName = anonymous || !name.trim() ? 'Anonymous' : name; //Setname to 'Anonymous' if name empty or anonymous is true
    //Submit as FrontEndData
    const FrontEndData = {
      name: finalName,
      complaint: RawComplaint, category,
      latitude: location?.latitude,
      longitude: location?.longitude,
      image: imageBase64,
    };

    //Return to flask backend
    try {
      const response = await fetch('http://<YOUR-IP>:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(FrontEndData),
      });

      if (response.ok) {
        Alert.alert('Complaint Submitted');
        //Resets form
        setName('');
        setDescription('');
        setCategory('');
        setImageUri(null);
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
        <CheckBox
          value={anonymous}
          onValueChange={setAnonymous}
          style={styles.checkbox}
        />
        <Text style={styles.label}>Send as Anonymous</Text>
      </View>

      <TextInput
        placeholder="Add Complaint"
        value={RawComplaint}
        onChangeText={setDescription}
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

      {location && (
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
    marginBottom: 5,
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
  image: {
    width: '100%',
    height: 200,
    marginTop: 15,
    borderRadius: 8,
  },
  locationText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default ComplaintFormScreen;