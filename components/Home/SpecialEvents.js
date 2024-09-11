import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment'; // Ensure you have moment installed

const SpecialEvents = ({ specialEvents = [] }) => {
  return (
    <View style={styles.specialEvents}>
      {specialEvents.length > 0 ? (
        specialEvents.map((event, index) => (
          <View key={index} style={styles.specialEvent}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDate}>{moment(event.date).format('MMMM Do YYYY, h:mm:ss a')}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noEvents}>No special events found</Text>
      )}
    </View>
  );
};

SpecialEvents.propTypes = {
  specialEvents: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      date: PropTypes.instanceOf(Date).isRequired,
    })
  ),
};

const styles = StyleSheet.create({
  specialEvents: {
    padding: 10,
  },
  specialEvent: {
    marginBottom: 10,
  },
  eventName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventDate: {
    color: 'gray',
  },
  noEvents: {
    fontStyle: 'italic',
    color: 'gray',
  },
});

export default SpecialEvents;

