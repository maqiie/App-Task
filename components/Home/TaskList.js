import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const TaskList = ({ tasks, onTaskClick, onCompleteTask, onDeleteTask }) => {
  return (
    <View style={styles.taskList}>
      {tasks.map(task => (
        <View key={task.id} style={styles.taskItem}>
          <TouchableOpacity onPress={() => onTaskClick(task)} style={styles.taskDetails}>
            <Text style={styles.title}>{task.title}</Text>
            <Text>{task.description}</Text>
          </TouchableOpacity>
          <Button title="Complete" onPress={() => onCompleteTask(task.id)} />
          <Button title={<FontAwesome name="trash" size={24} />} onPress={() => onDeleteTask(task.id)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  taskList: {
    padding: 10,
  },
  taskItem: {
    marginBottom: 10,
  },
  taskDetails: {
    marginBottom: 5,
  },
  title: {
    fontWeight: 'bold',
  },
});

export default TaskList;
