import React from 'react';
import { View, StyleSheet, Platform, StatusBar, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import TasksTab from './tabs/TasksTab';
import CalendarTab from './tabs/CalendarTab';
import AnalyticsTab from './tabs/AnalyticsTab';

const Tab = createMaterialTopTabNavigator();

const HomeScreen = ({ navigation }) => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={24} color="#2196F3" />
          <Text style={styles.username}>{user?.name || 'User'}</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: '#666',
            tabBarIndicatorStyle: {
              backgroundColor: '#2196F3',
            },
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: '600',
              textTransform: 'none',
            },
            tabBarStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
              backgroundColor: 'white',
            },
          }}
        >
          <Tab.Screen 
            name="Tasks" 
            component={TasksTab}
            options={{
              tabBarLabel: 'Tasks',
            }}
          />
          <Tab.Screen 
            name="Calendar" 
            component={CalendarTab}
            options={{
              tabBarLabel: 'Calendar',
            }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={AnalyticsTab}
            options={{
              tabBarLabel: 'Analytics',
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
  },
  logoutButtonPressed: {
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
});

export default HomeScreen;