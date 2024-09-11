import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

const TaskDetailsPopup = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={Boolean(task)}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContent}>
          <Text style={styles.title}>{task.title}</Text>
          <Text>{task.description}</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TaskDetailsPopup;
