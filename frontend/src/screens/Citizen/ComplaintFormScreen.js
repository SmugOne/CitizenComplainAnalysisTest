import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

const ComplaintFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "Permission to access gallery is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Permission to access location is required.");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
  };

  const handleSubmit = () => {
    // validation here if needed
    Alert.alert('Complaint Submitted', 'Thank you for your complaint!');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint Form</Text>

      <TextInput
        placeholder="Name (optional or Anonymous)"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={name}
          onValueChange={setName => setName('Anonymous')}
          style={styles.checkbox}
        />
        <Text style={styles.label}>Send as Anonymous</Text>
      </View>

      <TextInput
        placeholder="Add Complaint"
        value={description}
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
          <Picker.Item label="Garbage Collection" value="garbage" />
          <Picker.Item label="Road Damage" value="road" />
          <Picker.Item label="Water Supply" value="water" />
          <Picker.Item label="Electricity Issue" value="electricity" />
          <Picker.Item label="Others" value="others" />
        </Picker>
      </View>

      <View style={styles.buttonSpacing}>
        <Button title="Upload Image" onPress={handlePickImage} />
      </View>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

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
  },
  checkbox: {
    alignSelf: 'center',
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