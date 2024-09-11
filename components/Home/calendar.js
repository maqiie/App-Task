// Calendar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Calendar = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Calendar Placeholder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default Calendar;
