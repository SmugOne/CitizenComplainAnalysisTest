import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citizen Complaint Program</Text>

      <View style={styles.buttonSpacing}>
        <Button
          title="Submit a Complaint"
          onPress={() => navigation.navigate('Complaint Form')}
        />
      </View>

      <View style={styles.buttonSpacing}>
        <Button
          title="View Complaint History"
          onPress={() => navigation.navigate('Complaint History')}
        />
      </View>

      <View style={styles.buttonSpacing}>
        <Button
          title="Track Complaint Status"
          onPress={() => navigation.navigate('Complaint Status')}
        />
      </View>

      {/* Admin Login button positioned at the upper right */}
      <View style={styles.adminButtonContainer}>
        <Button
          title="Admin Login"
          onPress={() => navigation.navigate('Admin Login')}
          color="#ff3333"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    position: 'relative',  // Make sure the container has relative positioning
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonSpacing: {
    marginBottom: 20,
  },
  adminButtonContainer: {
    position: 'absolute',
    top: 16,        // Adjust to your preference
    right: 16,      // Adjust to your preference
    width: 'auto',  // Keep button width auto for a smaller button
  },
});

export default HomeScreen;