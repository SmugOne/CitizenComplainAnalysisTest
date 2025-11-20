// // Unused Screen
// import React, { useState, useEffect } from 'react';
// import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,} from 'react-native';
// import Checkbox from 'expo-checkbox';
// import * as Location from 'expo-location';
// import { Picker } from '@react-native-picker/picker';
// import Animated, { FadeInDown } from 'react-native-reanimated';
// import { API_URL } from '@env';  // <-- Import API_URL here

// const ComplaintFormScreen = ({ navigation }) => {
//   const [name, setName] = useState('');
//   const [RawComplaint, setComplaint] = useState('');
//   const [category, setCategory] = useState('');
//   const [location, setLocation] = useState(null);
//   const [anonymous, setAnonymous] = useState(false);

//   useEffect(() => {
//     if (anonymous) {
//       setName('Anonymous');
//     } else {
//       setName('');
//     }
//   }, [anonymous]);

//   const handleGetLocation = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission Denied', 'Permission to access location is required.');
//       return;
//     }

//     try {
//       const currentLocation = await Location.getCurrentPositionAsync({});
//       const [address] = await Location.reverseGeocodeAsync({
//         latitude: currentLocation.coords.latitude,
//         longitude: currentLocation.coords.longitude,
//       });

//       const barangay = address.subdistrict || address.district || '';
//       const city = address.city || address.region || '';
//       const locationString = `${barangay ? barangay + ', ' : ''}${city}`;

//       setLocation(locationString);
//     } catch (error) {
//       console.error('Location error: ', error);
//       Alert.alert('Error getting location');
//     }
//   };

//   const handleSubmit = async () => {
//     let finalName = anonymous || !name.trim() ? 'Anonymous' : name;

//     if (!RawComplaint.trim()) {
//       Alert.alert('Complaint Missing', 'Please enter your complaint before submitting.');
//       return;
//     }

//     const FrontEndData = {
//       name: finalName,
//       complaint: RawComplaint,
//       category: category || null,
//       location: location ?? null,
//     };

//     try {
//       const response = await fetch(`${API_URL}/api/complaints`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(FrontEndData),
//       });

//       if (response.ok) {
//         Alert.alert('Complaint Submitted', '', [
//           {
//             text: 'OK',
//             onPress: () => {
//               setName('');
//               setComplaint('');
//               setCategory('');
//               setLocation(null);
//               setAnonymous(false);
//               navigation.replace('Home');
//             },
//           },
//         ]);
//       } else {
//         const errorText = await response.text();
//         Alert.alert(`Failed to submit complaint: ${errorText}`);
//       }
//     } catch (error) {
//       console.error('Fetch error:', error);
//       Alert.alert('Failed to submit complaint.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
//         Complaint Form
//       </Animated.Text>

//       {!anonymous && (
//         <TextInput
//           placeholder="Name (optional)"
//           value={name}
//           onChangeText={setName}
//           style={styles.input}
//         />
//       )}

//       <View style={styles.checkboxContainer}>
//         <Checkbox
//           value={anonymous}
//           onValueChange={setAnonymous}
//           color={anonymous ? '#4630EB' : undefined}
//           style={styles.checkbox}
//         />
//         <Text style={styles.label}>Send as Anonymous</Text>
//       </View>

//       <TextInput
//         placeholder="Add Complaint"
//         value={RawComplaint}
//         onChangeText={setComplaint}
//         multiline
//         style={[styles.input, { height: 100 }]}
//       />

//       <Text style={styles.label}>Category:</Text>
//       <View style={styles.pickerContainer}>
//         <Picker selectedValue={category} onValueChange={setCategory}>
//           <Picker.Item label="Select Category" value="" />
//           <Picker.Item label="Garbage Collection" value="DENR" />
//           <Picker.Item label="Road Damage" value="DPWH" />
//           <Picker.Item label="Water Services" value="DENR" />
//           <Picker.Item label="Electricity Services" value="DOE" />
//           <Picker.Item label="Education Services" value="DEPED" />
//           <Picker.Item label="Corruption" value="OMBUDSMAN" />
//           <Picker.Item label="Others" value="NA" />
//         </Picker>
//       </View>

//       <TouchableOpacity style={styles.getLocationBtn} onPress={handleGetLocation}>
//         <Text style={styles.getLocationText}>Get Location</Text>
//       </TouchableOpacity>

//       {location && <Text style={styles.locationText}>Location: {location}</Text>}

//       <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//         <Text style={styles.submitBtnText}>Submit Complaint</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.navigate('Home')}
//       >
//         <Text style={styles.backBtnText}>Back to Home</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#e6f0ff',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '900',
//     textAlign: 'center',
//     marginBottom: 25,
//     color: '#2c3e50',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#888',
//     borderRadius: 12,
//     padding: 14,
//     fontSize: 16,
//     backgroundColor: '#fff',
//     marginBottom: 15,
//     elevation: 3,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#34495e',
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#888',
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     marginBottom: 15,
//     elevation: 3,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   checkbox: {
//     marginRight: 10,
//   },
//   getLocationBtn: {
//     backgroundColor: '#3c82f6',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 15,
//     elevation: 4,
//   },
//   getLocationText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   locationText: {
//     fontSize: 14,
//     marginBottom: 20,
//     color: '#2c3e50',
//     textAlign: 'center',
//   },
//   submitBtn: {
//     backgroundColor: '#27ae60',
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginBottom: 20,
//     elevation: 4,
//   },
//   submitBtnText: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: '900',
//   },
//   backBtn: {
//     borderWidth: 1,
//     borderColor: '#888',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     elevation: 3,
//   },
//   backBtnText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#34495e',
//   },
// });

// export default ComplaintFormScreen;