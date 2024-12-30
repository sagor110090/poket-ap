import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Alert } from 'react-native';

const Tab = createMaterialTopTabNavigator();

const TabScreen = ({ children }) => (
  <SafeAreaView style={styles.container}>
    {children}
  </SafeAreaView>
);

const ExpenseOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getExpenseDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <TabScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </TabScreen>
    );
  }

  return (
    <TabScreen>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Expenses</Text>
            <Text style={styles.amount}>{dashboardData?.summary?.total_expenses?.formatted || '৳0.00'}</Text>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>This Month</Text>
            <Text style={styles.amount}>{dashboardData?.summary?.this_month?.formatted || '৳0.00'}</Text>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Last Month</Text>
            <Text style={styles.amount}>{dashboardData?.summary?.last_month?.formatted || '৳0.00'}</Text>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]} />
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>This Month by Category</Text>
          {dashboardData?.category_breakdown?.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <Text style={styles.categoryAmount}>{category.formatted_total}</Text>
            </View>
          ))}
        </View>

        <View style={styles.expenseSection}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {dashboardData?.recent_expenses?.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseName}>{expense.title}</Text>
                <Text style={styles.expenseDate}>
                  {expense.expense_date} • {expense.category}
                </Text>
              </View>
              <Text style={styles.expenseAmount}>{expense.formatted_amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </TabScreen>
  );
};

const ExpensesList = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExpenses = async () => {
    try {
      const data = await api.getExpenseDashboard();
      setExpenses(data.recent_expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [navigation]);

  const handleEdit = (expense) => {
    navigation.navigate('NewExpense', { expense });
  };

  const handleDelete = async (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteExpense(expenseId);
              await fetchExpenses(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <TabScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </TabScreen>
    );
  }

  return (
    <TabScreen>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {expenses.map((expense) => (
          <TouchableOpacity
            key={expense.id}
            style={styles.expenseItem}
            onPress={() => handleEdit(expense)}
          >
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseName}>{expense.title}</Text>
              <Text style={styles.expenseDate}>
                {expense.expense_date} • {expense.category}
              </Text>
            </View>
            <View style={styles.expenseActions}>
              <Text style={styles.expenseAmount}>{expense.formatted_amount}</Text>
              <TouchableOpacity
                onPress={() => handleDelete(expense.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewExpense')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </TabScreen>
  );
};

const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await api.getExpenseDashboard();
      setCategories(data.category_breakdown || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <TabScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </TabScreen>
    );
  }

  return (
    <TabScreen>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {categories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{category.category}</Text>
            <Text style={styles.categoryAmount}>{category.formatted_total}</Text>
          </View>
        ))}
      </ScrollView>
    </TabScreen>
  );
};

const ExpenseScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  expenseSection: {
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
    marginBottom: 8,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  expenseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default ExpenseScreen;
