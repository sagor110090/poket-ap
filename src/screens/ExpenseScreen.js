import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const ExpenseOverview = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Expenses</Text>
          <Text style={styles.amount}>৳300.00</Text>
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>This Month</Text>
          <Text style={styles.amount}>৳300.00</Text>
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Last Month</Text>
          <Text style={styles.amount}>৳0.00</Text>
          <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]} />
        </View>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>This Month by Category</Text>
        <View style={styles.categoryItem}>
          <Text style={styles.categoryName}>General</Text>
          <Text style={styles.categoryAmount}>৳300.00</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const ExpensesList = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.expenseItem}>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseName}>arish pampash</Text>
          <Text style={styles.expenseDate}>Dec 29, 2024 • General</Text>
        </View>
        <Text style={styles.expenseAmount}>৳300.00</Text>
      </View>
    </ScrollView>
  );
};

const CategoriesTab = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.categoryItem}>
        <Text style={styles.categoryName}>General</Text>
        <Text style={styles.categoryAmount}>৳300.00</Text>
      </View>
    </ScrollView>
  );
};

const ExpenseScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarIndicatorStyle: styles.tabIndicator,
      }}>
      <Tab.Screen name="Overview" component={ExpenseOverview} />
      <Tab.Screen name="Expenses" component={ExpensesList} />
      <Tab.Screen name="Categories" component={CategoriesTab} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categorySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
