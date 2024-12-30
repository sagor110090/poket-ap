import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh analytics when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  const fetchAnalytics = async () => {
    try {
      const response = await api.getTasks();
      const stats = calculateStats(response || []);
      setAnalytics(stats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        completionRate: 0,
        categories: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;

    // Group tasks by category
    const categories = tasks.reduce((acc, task) => {
      const categoryName = task.category?.title || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          total: 0,
          completed: 0,
          pending: 0
        };
      }
      acc[categoryName].total++;
      if (task.status === 'completed') {
        acc[categoryName].completed++;
      } else {
        acc[categoryName].pending++;
      }
      return acc;
    }, {});

    return {
      total,
      completed,
      pending,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      categories
    };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={[styles.overviewCard, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#1976D2" />
          <Text style={styles.overviewTitle}>Completion Rate</Text>
          <Text style={styles.overviewValue}>{analytics.completionRate}%</Text>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="list" size={24} color="#388E3C" />
          <Text style={styles.overviewTitle}>Total Tasks</Text>
          <Text style={styles.overviewValue}>{analytics.total}</Text>
        </View>
      </View>

      {/* Status Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Breakdown</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
            <Text style={styles.statusLabel}>Completed</Text>
            <Text style={styles.statusValue}>{analytics.completed}</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: '#FFA000' }]}>
              <Ionicons name="time" size={20} color="white" />
            </View>
            <Text style={styles.statusLabel}>Pending</Text>
            <Text style={styles.statusValue}>{analytics.pending}</Text>
          </View>
        </View>
      </View>

      {/* Category Distribution */}
      {Object.keys(analytics.categories).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Distribution</Text>
          {Object.entries(analytics.categories).map(([category, stats], index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(index) }]} />
                <Text style={styles.categoryName}>{category}</Text>
              </View>
              <Text style={styles.categoryCount}>{stats.total} tasks ({stats.completed} completed, {stats.pending} pending)</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const getCategoryColor = (index) => {
  const colors = ['#1976D2', '#388E3C', '#D32F2F', '#7B1FA2', '#C2185B', '#00796B'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: Platform.OS === 'ios' ? 1 : 0,
    backgroundColor: '#F5F6F8',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default AnalyticsTab;
