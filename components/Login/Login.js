import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons"; // Use Feather icons in Expo
import Toast from "react-native-toast-message"; // Import the Toast library
import apiClient from "../../services/apiService";
import profile from '../Profile/Profile'

const Login = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    isSignUp: false,
    usernameOrEmail: "",
    name: "",
    password: "",
    confirmPassword: "",
    loading: false,
    showPassword: false,
    rememberMe: false,
  });

  const {
    isSignUp,
    usernameOrEmail,
    name,
    password,
    confirmPassword,
    loading,
    showPassword,
    rememberMe,
  } = formData;

  const handleSwitchClick = () => {
    setFormData({ ...formData, isSignUp: !isSignUp });
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setFormData({ ...formData, showPassword: !showPassword });
  };

  const handleRememberMeToggle = () => {
    setFormData({ ...formData, rememberMe: !rememberMe });
  };

  const handleLoginSuccess = () => {
    Toast.show({
      type: "success",
      text1: "Login successful!",
      text2: "Welcome back!",
    });
    setTimeout(() => {
      navigation.navigate("UserProfile"); // Use the correct screen name defined in your navigator
    }, 1000);
  };

  const handleForgotPasswordClick = () => {
    Alert.alert("Forgot Password?", "Feature coming soon...");
  };

  const handleFormSubmit = async () => {
    if (isSignUp) {
      await registerRequest();
    } else {
      await loginRequest(usernameOrEmail, password);
    }
  };

  // const loginRequest = async (usernameOrEmail, password) => {
  //   try {
  //     setFormData({ ...formData, loading: true });

  //     const response = await apiClient.post("/auth/sign_in", {
  //       email: usernameOrEmail,
  //       password,
  //     });

  //     if (response.status === 200) {
  //       const authTokenHeader = response.headers["authorization"];
  //       if (authTokenHeader) {
  //         const authToken = authTokenHeader.split("Bearer ")[1];
  //         // Save token to async storage or secure storage
  //         handleLoginSuccess();
  //       } else {
  //         throw new Error("Authorization token not found in response");
  //       }
  //     } else {
  //       throw new Error("Invalid response from server");
  //     }
  //   } catch (error) {
  //     console.error("Error with login request:", error);
  //     Alert.alert("Error", "Invalid email or password");
  //   } finally {
  //     setFormData({ ...formData, loading: false });
  //   }
  // };
 const loginRequest = async (usernameOrEmail, password) => {
   try {
     setFormData({ ...formData, loading: true });

     const response = await apiClient.post("/auth/sign_in", {
       email: usernameOrEmail,
       password,
     });

     if (response.status === 200) {
       const authTokenHeader = response.headers["authorization"];
       if (authTokenHeader) {
         const authToken = authTokenHeader.split("Bearer ")[1];
         await AsyncStorage.setItem("authToken", authToken);
         handleLoginSuccess();
       } else {
         throw new Error("Authorization token not found in response");
       }
     } else {
       throw new Error("Invalid response from server");
     }
   } catch (error) {
     console.error("Error with login request:", error);
     if (error.response && error.response.status === 401) {
       Alert.alert("Error", "Invalid email or password");
     } else {
       Alert.alert("Error", "An unexpected error occurred. Please try again later.");
     }
   } finally {
     setFormData({ ...formData, loading: false });
   }
 };



  const registerRequest = async () => {
    try {
      setFormData({ ...formData, loading: true });

      const response = await apiClient.post("/auth", {
        user: {
          name,
          email: usernameOrEmail,
          password,
          password_confirmation: confirmPassword,
        },
      });

      if (
        (response.status === 201 || response.status === 200) &&
        response.data &&
        response.data.status === "success"
      ) {
        Alert.alert("Success", "User created successfully! Please login");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error with registration request:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setFormData({ ...formData, loading: false });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={handleSwitchClick} style={styles.switch}>
          <Text
            style={[
              styles.switchText,
              { color: isSignUp ? "#6B46C1" : "#3182CE" },
            ]}
          >
            Switch to {isSignUp ? "Login" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={isSignUp ? "Email" : "Username"}
            value={usernameOrEmail}
            onChangeText={(text) => handleInputChange("usernameOrEmail", text)}
            autoCapitalize="none"
            keyboardType={isSignUp ? "email-address" : "default"}
          />

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={(text) => handleInputChange("name", text)}
              autoCapitalize="words"
            />
          )}

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="Password"
              value={password}
              onChangeText={(text) => handleInputChange("password", text)}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.iconButton}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#6B46C1"
              />
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) =>
                handleInputChange("confirmPassword", text)
              }
            />
          )}

          {!isSignUp && (
            <View style={styles.rememberForgotContainer}>
              <TouchableOpacity
                onPress={handleRememberMeToggle}
                style={styles.rememberMeContainer}
              >
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleForgotPasswordClick}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isSignUp ? "#6B46C1" : "#3182CE" },
            ]}
            onPress={handleFormSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? "Sign Up" : "Login"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    zIndex: 10,
  },
  switch: {
    alignItems: "center",
    marginBottom: 20,
  },
  switchText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  form: {},
  inputBox: {
    position: "relative",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  iconButton: {
    position: "absolute",
    right: 10,
    top: 10,
    bottom: 10,
    justifyContent: "center",
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberMeText: {
    color: "#333",
  },
  forgotPasswordText: {
    color: "#3182CE",
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Login;
