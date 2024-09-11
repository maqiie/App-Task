// Home.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Button, TouchableOpacity, FlatList, Modal, StyleSheet, Platform, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather'; // Use Feather icons or any other icon library
import CalendarPicker from 'react-native-calendar-picker'; // Install and use a calendar picker component
import 'react-native-gesture-handler';
import apiClient from "../../services/apiService";

const { width } = Dimensions.get('window'); // Define `width` here


const Home = ({ currentUser }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [specialEvents, setSpecialEvents] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [upcomingTask, setUpcomingTask] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [completed, setCompleted] = useState(false); // New state variable to track completion
  const [currentTaskTimer, setCurrentTaskTimer] = useState(null); // Define setCurrentTaskTimer


  const now = new Date();
  const currentHour = now.getHours();
  let greeting = "";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  const currentDate = new Date(); // This gets the current date and time in UTC
  const localCurrentDate = new Date(
    currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
  ); // This converts the UTC time to local time
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (currentUser) {
        try {
          const response = await apiClient.get("/messages/unread-count");
          setUnreadMessages(response.data.count); // Adjust based on your API response
        } catch (error) {
          console.error("Error fetching unread messages count:", error);
        }
      }
    };

    fetchUnreadMessages();
  }, [currentUser]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await apiClient.get("/reminders");
      // Filter out tasks where completed is true
      const incompleteTasks = response.data.filter((task) => !task.completed);
      // Update the state with incomplete tasks only
      setTasks(incompleteTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fetchCompletedTasks = async () => {
    try {
      const response = await apiClient.get("/reminders");
      // Filter out reminders where completed is true
      const completedReminders = response.data.filter(
        (reminder) => reminder.completed
      );
      return completedReminders;
    } catch (error) {
      console.error("Error fetching completed reminders:", error);
      return []; // Return an empty array in case of error
    }
  };

  const fetchSpecialEvents = async () => {
    try {
      const response = await apiClient.get("/reminders");
      // Filter special events from the response data
      const specialEventsData = response.data.filter(
        (event) => event.is_special_event
      );
      // Log the filtered special events data to verify
      console.log("Special Events Data:", specialEventsData);
      // Set the filtered special events in state
      setSpecialEvents(specialEventsData);
    } catch (error) {
      console.error("Error fetching special events:", error);
    }
  };

  useEffect(() => {
    fetchSpecialEvents();
  }, []);

  // Example usage of fetchCompletedTasks:
  const loadCompletedTasks = async () => {
    try {
      const completedTasksData = await fetchCompletedTasks(); // Fetch completed tasks data
      setCompletedTasks(completedTasksData); // Update the completedTasks state with the fetched data
      console.log("Completed Tasks:", completedTasksData);
      // Do something with the completed tasks
    } catch (error) {
      console.error("Error loading completed tasks:", error);
    }
  };
  useEffect(() => {
    fetchTasks(); // Fetch incomplete tasks
    loadCompletedTasks(); // Fetch completed tasks
  }, []); // Empty dependency array to run this effect only once when the component mounts

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedDay(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const calculateEndTime = (dueDate, duration) => {
    if (!duration) {
      return dueDate; // Return dueDate if duration is null
    }

    const durationMinutes = parseInt(duration.split("-")[1], 10);
    const endTime = new Date(dueDate);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime;
  };

  const updateTasks = useCallback(() => {
    const now = new Date();
    const upcoming = tasks
      .filter((task) => new Date(task.due_date).getTime() > now.getTime())
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    const ongoing = tasks.filter((task) => {
      const dueDate = new Date(task.due_date);
      const endTime = new Date(dueDate.getTime() + task.duration * 60000); // Convert duration to milliseconds
      return now >= dueDate && now < endTime;
    });

    // If there's an ongoing task, set it as current task
    if (ongoing.length > 0) {
      setCurrentTask(ongoing[0]);
      setUpcomingTask(
        upcoming[0] && ongoing[0].id !== upcoming[0].id ? upcoming[0] : null
      );
    } else {
      // If no ongoing task, check for upcoming tasks
      if (upcoming.length > 0) {
        // Check if upcoming task's due time has arrived
        if (new Date(upcoming[0].due_date).getTime() <= now.getTime()) {
          // Set upcoming task as current task
          setCurrentTask(upcoming[0]);
          // Calculate end time for the upcoming task
          const endTime = calculateEndTime(
            new Date(upcoming[0].due_date),
            upcoming[0].duration
          );
          // Schedule a function to unset the current task after its duration
          const timer = setTimeout(() => {
            setCurrentTask(null);
          }, endTime.getTime() - now.getTime());
          // Save the timer reference so it can be cleared later if needed
          setCurrentTaskTimer(timer);
          // Set the next upcoming task if available
          setUpcomingTask(upcoming[1] || null);
        } else {
          // If upcoming task's due time hasn't arrived yet, set it as upcoming task
          setCurrentTask(null);
          setUpcomingTask(upcoming[0]);
        }
      } else {
        // If no ongoing or upcoming tasks, set both to null
        setCurrentTask(null);
        setUpcomingTask(null);
      }
    }
  }, [tasks]);

  useEffect(() => {
    updateTasks();
    const interval = setInterval(updateTasks, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [tasks, updateTasks]);

  const calculateTimeUntil = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    if (diff <= 0) return "Now";
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  const calculateTimeRemaining = (endTime) => {
    const now = new Date();
    const timeDiff = endTime - now;

    if (timeDiff <= 0) {
      return "Task is already over";
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  if (currentTask) {
    const endTime = new Date(currentTask.due_date);
    const durationMilliseconds = currentTask.duration * 60000; // Convert duration to milliseconds
    endTime.setTime(endTime.getTime() + durationMilliseconds); // Add duration to the due date
    const timeRemaining = calculateTimeRemaining(endTime);
    console.log("Time remaining for current task:", timeRemaining);
  }

  const handleCompleteTask = async (reminderId) => {
    try {
      await apiClient.patch(`/reminders/${reminderId}/complete`, {
        completed: true,
      });
      // Update the tasks state to remove the completed task
      setTasks((updatedTasks) =>
        updatedTasks.filter((task) => task.id !== reminderId)
      );
      // Update the current task and upcoming task if needed
      updateTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const upcoming = tasks
    .filter((task) => {
      const dueDate = new Date(task.due_date);
      return dueDate.getTime() > now.getTime() && !task.completed;
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const currentTasks = tasks.filter((task) => {
    const dueDate = new Date(task.due_date);
    const endTime = calculateEndTime(dueDate, task.duration);
    // Check if task is ongoing and not completed
    return now >= dueDate && now < endTime && !task.completed;
  });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  const handleDetailsClick = (task) => {
    setSelectedTask(task);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleDeleteClick = async (reminderId) => {
    try {
      await apiClient.delete(`/reminders/${reminderId}`);
      // Update the tasks state to remove the deleted reminder
      setTasks((tasks) => tasks.filter((task) => task.id !== reminderId));
      // Close the popup and clear the selected task
      setShowPopup(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleClickDay = (day) => {
    setSelectedDay(day);
  };

  const addSpecialEvent = (date, name) => {
    const newEvent = { date, name };
    setSpecialEvents([...specialEvents, newEvent]);
  };
  const handleReschedule = (task) => {
    navigate("/create", { state: { taskToReschedule: task } });
  };
  return (
      <ScrollView style={styles.container}>

    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profilePicture}
        >
          {currentUser && currentUser.profilePicture ? (
            <Image
              source={{ uri: currentUser.profilePicture }}
              style={styles.profilePictureImage}
            />
          ) : (
            <Icon name="user" size={30} color="#6B7280" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Chat')}
          style={styles.bellIcon}
        >
          <Icon name="bell" size={30} color="#6B7280" />
          {unreadMessages > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadMessages}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {currentTask ? (
          <View style={styles.taskCard}>
            <Text style={styles.cardTitle}>Current Task</Text>
            <View style={styles.taskContent}>
              <Icon name="star" size={48} color="#FBBF24" />
              <View style={styles.taskDetails}>
                <Text style={styles.taskTitle}>
                  {currentTask.title || 'No Title'}
                </Text>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskInfoText}>
                    Due: <Text style={styles.taskInfoValue}>
                      {currentTask.due_date
                        ? new Date(currentTask.due_date).toLocaleDateString()
                        : 'No Due Date'}
                    </Text>
                  </Text>
                  <Text style={styles.taskInfoText}>
                    Priority: <Text style={styles.taskInfoValue}>
                      {currentTask.priority || 'No Priority'}
                    </Text>
                  </Text>
                  <Text style={styles.taskInfoText}>
                    Duration: <Text style={styles.taskInfoValue}>
                      {currentTask.duration || 'No Duration'}
                    </Text>
                  </Text>
                  {currentTask.due_date ? (
                    <Text style={styles.taskInfoText}>
                      Time Remaining: <Text style={styles.taskInfoValue}>
                        {calculateTimeRemaining(
                          new Date(currentTask.due_date).getTime() +
                            currentTask.duration * 60000
                        )}
                      </Text>
                    </Text>
                  ) : null}
                </View>
                <Button
                  title="Complete"
                  onPress={() => handleCompleteTask(currentTask.id)}
                  color="#10B981"
                />
              </View>
            </View>
          </View>
        ) : upcomingTask ? (
          <View style={styles.taskCard}>
            <Text style={styles.cardTitle}>Upcoming Task</Text>
            <View style={styles.taskContent}>
              <Icon name="star" size={48} color="#FBBF24" />
              <View style={styles.taskDetails}>
                <Text style={styles.taskTitle}>{upcomingTask.title}</Text>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskInfoText}>
                    Due: <Text style={styles.taskInfoValue}>
                      {new Date(upcomingTask.due_date).toLocaleDateString()}
                    </Text>
                  </Text>
                  <Text style={styles.taskInfoText}>
                    Priority: <Text style={styles.taskInfoValue}>
                      {upcomingTask.priority}
                    </Text>
                  </Text>
                  <Text style={styles.taskInfoText}>
                    Time Until: <Text style={styles.taskInfoValue}>
                      {calculateTimeUntil(new Date(upcomingTask.due_date))}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : tasks.length > 0 ? (
          <View style={styles.taskCard}>
            <Text style={styles.cardTitle}>No Tasks</Text>
            <Text style={styles.noTasksMessage}>
              You have no upcoming tasks.
            </Text>
          </View>
        ) : null}

        <Text style={styles.greeting}>
          {greeting},{' '}
          <Text style={styles.userName}>
            {currentUser ? currentUser.name : 'Guest'}
          </Text>
          !
        </Text>
        <Text style={styles.subtitle}>
          Stay organized and boost your productivity!
        </Text>
        <View style={styles.buttonsContainer}>
          <Button
            title="Create Task"
            onPress={() => navigation.navigate('Create')}
            color="#8B5CF6"
          />
          <Button
            title="View Tasks"
            onPress={() => navigation.navigate('Tasks')}
            color="#374151"
          />
        </View>

        <View style={styles.upcomingTasksContainer}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          <FlatList
            data={tasks.filter(task => new Date(task.due_date) >= new Date())}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.upcomingTaskItem}>
                <View style={styles.upcomingTaskDetails}>
                  <Text style={styles.upcomingTaskTitle}>{item.title}</Text>
                  <Text style={styles.upcomingTaskDate}>
                    Due: {new Date(item.due_date).toLocaleDateString()}
                  </Text>
                </View>
                <Button
                  title="Details"
                  onPress={() => handleDetailsClick(item)}
                  color="#8B5CF6"
                />
              </View>
            )}
          />
        </View>

        <Modal
          transparent
          visible={showPopup}
          onRequestClose={handleClosePopup}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
              <Text style={styles.modalText}>
                Due: {new Date(selectedTask?.due_date).toLocaleDateString()}
              </Text>
              <Text style={styles.modalText}>
                Location: {selectedTask?.location}
              </Text>
              <Text style={styles.modalDescription}>{selectedTask?.description}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleClosePopup}>
                  <Text style={styles.modalActionText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteClick(selectedTask?.id)}>
                  <Text style={styles.modalActionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Calendar</Text>
          <CalendarPicker
            onDateChange={date => {
              // Handle date selection
            }}
            selectedDay={selectedDay}
            // Additional props and styling for the calendar
          />
        </View>

        <View style={styles.notificationsContainer}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.notificationSection}>
            <Text style={styles.notificationTitle}>Missed Tasks</Text>
            <FlatList
              data={tasks.filter(task => new Date(task.due_date) < new Date()).slice(-4)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationText}>
                    You missed the task: {item.title}
                  </Text>
                  <Button
                    title="Reschedule"
                    onPress={() => handleReschedule(item)}
                    color="#374151"
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.notificationSection}>
            <Text style={styles.notificationTitle}>Completed Tasks</Text>
            <FlatList
              data={completedTasks.slice(0, 3)}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationText}>
                    Task completed: {item.title}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </View>
        </ScrollView>

  );
};



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    paddingBottom: 20, // Padding for better scroll view end
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4F46E5', // Indigo color for the navbar
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profilePictureImage: {
    width: '100%',
    height: '100%',
  },
  bellIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#EF4444', // Red color for the badge
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 15,
  },
  taskCard: {
    backgroundColor: '#4F46E5', // Indigo color for the card
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetails: {
    marginLeft: 15,
    flex: 1,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskInfo: {
    marginBottom: 10,
  },
  taskInfoText: {
    color: '#E5E7EB', // Light gray for task info
  },
  taskInfoValue: {
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // Dark gray for greeting
    marginBottom: 10,
  },
  userName: {
    color: '#4F46E5', // Indigo color for username
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280', // Gray for subtitle
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  button: {
    marginBottom: 10,
  },
  upcomingTasksContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  upcomingTaskItem: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  upcomingTaskDetails: {
    flex: 1,
  },
  upcomingTaskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upcomingTaskDate: {
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  notificationsContainer: {
    marginBottom: 20,
  },
  notificationSection: {
    marginBottom: 15,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  notificationItem: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  notificationText: {
    fontSize: 16,
  },
});



export default Home;
