// EventItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EventItem = ({ event }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{event.name}</Text>
      <Text style={styles.date}>{event.date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a148c',
  },
  date: {
    fontSize: 14,
    color: '#333333',
  },
});

export default EventItem;
