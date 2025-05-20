import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={[styles.container, { backgroundColor: '#e6f0ff' }]}>
      <View style={styles.centerContent}>
        <Animated.Text entering={FadeInDown.delay(100)} style={styles.title}>
          Citizen Complaint Program
        </Animated.Text>

        <View style={styles.buttonsWrapper}>
          <Animated.View entering={FadeInDown.delay(300)} style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Complaint Form')}
            >
              <Text style={styles.buttonText}>Submit a Complaint</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ff5252' }]}
              onPress={() => navigation.navigate('Admin Login')}
            >
              <Text style={styles.buttonText}>Admin Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',  // centers vertically
    alignItems: 'center',      // centers horizontally
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: 'black',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonsWrapper: {
    width: '100%',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3c82f6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;