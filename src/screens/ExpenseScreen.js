import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ExpenseOverview from './tabs/expense/ExpenseOverviewTab';
import ExpensesList from './tabs/expense/ExpenseListTab';
import CategoriesTab from './tabs/expense/ExpenseCategoriesTab';

const Tab = createMaterialTopTabNavigator();

const ExpenseScreen = ({ navigation }) => {
  const [refresh, setRefresh] = useState(0);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefresh(prev => prev + 1);
    });

    return unsubscribe;
  }, [navigation]);

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
          key={refresh}
          screenOptions={{
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: '#666',
            tabBarLabelStyle: styles.tabLabel,
            tabBarStyle: styles.tabBar,
            tabBarIndicatorStyle: styles.tabIndicator,
          }}>
          <Tab.Screen
            name="Overview"
            component={ExpenseOverview}
            options={{
              tabBarLabel: 'Overview',
            }}
          />
          <Tab.Screen
            name="Expenses"
            component={ExpensesList}
            options={{
              tabBarLabel: 'Expenses',
            }}
          />
          <Tab.Screen
            name="Categories"
            component={CategoriesTab}
            options={{
              tabBarLabel: 'Categories',
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
  tabBar: {
    backgroundColor: 'white',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabLabel: {
    fontSize: 14,
    textTransform: 'none',
    fontWeight: '600',
  },
  tabIndicator: {
    backgroundColor: '#2196F3',
    height: 3,
  },
});

export default ExpenseScreen;