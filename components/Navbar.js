

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Example icon library
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiService'; // Adjust import as needed

const Navbar = ({ currentUser, handleLogout }) => {
  const navigation = useNavigation();
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);

  // Fetch pending invitations when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const fetchPendingInvitations = async () => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          const response = await apiClient.get('/invitations', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const pendingInvitations = response.data.filter(
            (invitation) => invitation.status === 'pending'
          );
          setPendingInvitationsCount(pendingInvitations.length);
        } catch (error) {
          console.error('Error fetching invitations:', error);
        }
      };

      fetchPendingInvitations();
    }
  }, [currentUser]);

  return (
    <View style={styles.navbarContainer}>
      {/* Home Icon */}
      <TouchableOpacity
        style={styles.navbarIcon}
        onPress={() => navigation.navigate('Home')}
      >
        <Icon name="home" size={24} color="#fff" />
        <Text style={styles.tooltip}>Home</Text>
      </TouchableOpacity>

      {/* Upload Icon */}
      <TouchableOpacity
        style={styles.navbarIcon}
        onPress={() => navigation.navigate('Create')}
      >
        <Icon name="upload" size={24} color="#fff" />
        <Text style={styles.tooltip}>Upload</Text>
      </TouchableOpacity>

      {/* Conditionally render invitations or login/signup */}
      {currentUser ? (
        <>
          {/* Invitations Icon */}
          <TouchableOpacity
            style={styles.navbarIcon}
            onPress={() => navigation.navigate('Invitations')}
          >
            <Icon name="chat" size={24} color="#fff" />
            {pendingInvitationsCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badge}>{pendingInvitationsCount}</Text>
              </View>
            )}
            <Text style={styles.tooltip}>Invitations</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.navbarIcon}
            onPress={async () => {
              Alert.alert(
                "Confirm Logout",
                "Are you sure you want to logout?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Logout",
                    onPress: async () => {
                      await handleLogout();
                      navigation.navigate('Login');
                    },
                  },
                ]
              );
            }}
          >
            <Icon name="logout" size={24} color="#fff" />
            <Text style={styles.tooltip}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.navbarIcon}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="account" size={24} color="#fff" />
          <Text style={styles.tooltip}>Login/Signup</Text>
        </TouchableOpacity>
      )}

      {/* Search Icon */}
      <TouchableOpacity
        style={styles.navbarIcon}
        onPress={() => navigation.navigate('Search')}
      >
        <Icon name="magnify" size={24} color="#fff" />
        <Text style={styles.tooltip}>Search</Text>
      </TouchableOpacity>

      {/* Profile Icon */}
      {currentUser && (
        <TouchableOpacity
          style={styles.navbarIcon}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="account-circle" size={24} color="#fff" />
          <Text style={styles.tooltip}>Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 16,
    left: '5%',
    right: '5%',
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 4,
  },
  navbarIcon: {
    alignItems: 'center',
  },
  tooltip: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});

export default Navbar;
