// import {
//   StyleSheet,
//   Platform,
//   StatusBar,
//   View,
//   SafeAreaView,
//   Button,
// } from "react-native";
// import {useDimensions} from '@react-native-community/hooks'

// export default function App() {
//   console.log(useDimensions());

//   return (
//     <SafeAreaView style={[styles.container, containerStyle]}>
//       <View
//         style={{
//           backgroundColor: 'dodgeblue',
//           width: "50%",
//           height: 150
//         }}
//       ></View>
//     </SafeAreaView>
//   );
// }

// const containerStyle = { backgroundColor: "orange" };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "fff",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//   },
// });

// import React, { useState, useEffect } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import apiClient from './services/apiService';
// import Home from './components/Home/Home';
// import CreateTask from './components/CreateTask';
// import Calendar from './components/Calendar';
// import Login from './components/Login';
// import Task from './components/Task';
// import SpecialEvents from './components/SpecialEvents';
// import UserProfile from './components/UserProfile';
// import Notifications from './components/Notification';
// import FriendSearch from './components/Friend';
// import Invitations from './components/Invitations';
// import Chat from './components/Chat';

// const Stack = createStackNavigator();

// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [invitations, setInvitations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [authToken, setAuthToken] = useState(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const storedToken = localStorage.getItem("authToken"); // React Native doesn't use localStorage, use AsyncStorage
//       const isLoggedIn = !!storedToken;

//       if (isLoggedIn) {
//         try {
//           const response = await apiClient.get("/auth/validate_token");
//           setCurrentUser(response.data.data);
//           setAuthToken(storedToken);
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//           alert("Error fetching user data. Please try again.");
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   useEffect(() => {
//     const fetchInvitations = async () => {
//       if (currentUser && authToken) {
//         try {
//           const response = await apiClient.get("/invitations");
//           setInvitations(response.data);
//         } catch (error) {
//           console.error("Error fetching invitations:", error);
//           alert("Error fetching invitations. Please try again.");
//         }
//       }
//     };

//     fetchInvitations();
//   }, [currentUser, authToken]);

//   const invitationsCount = invitations.length;

//   const handleLogout = () => {
//     // Use AsyncStorage instead of localStorage
//     AsyncStorage.removeItem("authToken");
//     setCurrentUser(null);
//     setAuthToken(null);
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.center}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Home">
//           {props => <Home {...props} currentUser={currentUser} />}
//         </Stack.Screen>
//         <Stack.Screen name="CreateTask">
//           {props => currentUser ? <CreateTask {...props} /> : <Login />}
//         </Stack.Screen>
//         <Stack.Screen name="Calendar" component={Calendar} />
//         <Stack.Screen name="Login" component={Login} />
//         <Stack.Screen name="Task">
//           {props => currentUser ? <Task {...props} /> : <Login />}
//         </Stack.Screen>
//         <Stack.Screen name="SpecialEvents" component={SpecialEvents} />
//         <Stack.Screen name="UserProfile">
//           {props => <UserProfile {...props} userData={currentUser} onLogout={handleLogout} />}
//         </Stack.Screen>
//         <Stack.Screen name="FriendSearch">
//           {props => <FriendSearch {...props} userData={currentUser} />}
//         </Stack.Screen>
//         <Stack.Screen name="Invitations">
//           {props => <Invitations {...props} currentUser={currentUser} />}
//         </Stack.Screen>
//         <Stack.Screen name="Chat">
//           {props => <Chat {...props} currentUser={currentUser} authToken={authToken} />}
//         </Stack.Screen>
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default App;


import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./components/Home/Home"; // Your Home Component
import Login from "./components/Login/Login";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile/Profile"; // Ensure correct import

// Setup your API client
const apiClient = axios.create({
  baseURL: "http://10.0.2.2:3001/", // For Android emulator
  headers: {
    "Content-Type": "application/json",
  },
});

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Fetch user data and check if the user is logged in
  useEffect(() => {
    const fetchUserData = async () => {
      const storedToken = await AsyncStorage.getItem("authToken");
      const isLoggedIn = !!storedToken;

      if (isLoggedIn) {
        try {
          // Fetch user data if token is valid
          const response = await apiClient.get("/auth/validate_token", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          setCurrentUser(response.data.data);
          setAuthToken(storedToken);
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Error fetching user data. Please try again.");
          handleLogout(); // Log out the user if the token is invalid
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setCurrentUser(null);
      setAuthToken(null);
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Error during logout. Please try again.");
    }
  };

  // Create the Stack Navigator
  const Stack = createStackNavigator();

  // Show a loading spinner while fetching user data
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Navbar currentUser={currentUser} handleLogout={handleLogout} />
      <Stack.Navigator initialRouteName={currentUser ? "Home" : "Login"}>
        <Stack.Screen name="Home">
          {(props) => (
            <Home
              {...props}
              currentUser={currentUser}
              handleLogout={handleLogout}
              authToken={authToken}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="UserProfile">
          {(props) => (
            <Profile
              {...props}
              userData={currentUser} // Pass the necessary props
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {(props) => (
            <Login
              {...props}
              onLoginSuccess={async (userData, token) => {
                await AsyncStorage.setItem("authToken", token);
                setCurrentUser(userData);
                setAuthToken(token);
                props.navigation.navigate("Home");
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
