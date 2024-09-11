import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  Button, 
  StyleSheet, 
  Alert 
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import apiClient from "../../services/apiService";
const defaultImage = "https://via.placeholder.com/150";

const UserProfile = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    birthday: "",
    role: "",
    uid: "",
    image_url: defaultImage,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/auth/validate_token");
        setFormData({
          name: response.data.name || "",
          nickname: response.data.nickname || "",
          email: response.data.email || "",
          birthday: response.data.birthday || "",
          role: response.data.role || "",
          uid: response.data.uid || "",
          image_url: response.data.image_url || defaultImage,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load user data.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const calculateDaysUntilBirthday = () => {
    if (!formData.birthday) return null;
    const today = new Date();
    const birthday = new Date(formData.birthday);
    birthday.setFullYear(today.getFullYear());
    if (birthday < today) {
      birthday.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = birthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prevData) => ({
        ...prevData,
        image_url: result.assets[0].uri,
      }));
    } else {
      Alert.alert("Image selection cancelled");
    }
  };

  const handleSubmit = async () => {
    try {
      // Add your profile update logic here using apiClient
      await apiClient.put("/update_profile", formData); // Adjust the endpoint as needed
      Alert.alert("Profile Updated Successfully!");
    } catch (error) {
      Alert.alert("Error updating profile", error.message);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            style={styles.profileImage}
            source={{ uri: formData.image_url }}
            onError={() => setFormData({ ...formData, image_url: defaultImage })}
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageOverlayText}>+</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.userInfo}>{formData.name}</Text>
        <Text style={styles.userEmail}>{formData.email}</Text>
        <Text style={styles.userRole}>{formData.role}</Text>
        <Button title="Log Out" onPress={onLogout} color="#6b21a8" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleChange("name", value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nickname</Text>
        <TextInput
          style={styles.input}
          value={formData.nickname}
          onChangeText={(value) => handleChange("nickname", value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Birthday</Text>
        <TextInput
          style={styles.input}
          value={formData.birthday}
          onChangeText={(value) => handleChange("birthday", value)}
        />
      </View>

      {calculateDaysUntilBirthday() !== null && (
        <Text style={styles.birthdayMessage}>
          Your birthday is in {calculateDaysUntilBirthday()} days!
        </Text>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    justifyContent: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: "#ffffff",
    borderWidth: 5,
    marginBottom: 10,
  },
  imageOverlay: {
    position: "absolute",
    width: 150,
    height: 150,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlayText: {
    fontSize: 36,
    color: "white",
  },
  userInfo: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 18,
    color: "#666",
    marginBottom: 5,
  },
  userRole: {
    fontSize: 18,
    color: "#888",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#6b21a8",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  birthdayMessage: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
