import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TaskCard = ({ task, onPress, onToggleStatus, updatingTaskId }) => {
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'No due date';
    
    const date = new Date(dateTimeStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeString}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getStatusColor = (status) => {
    return status ? '#4CAF50' : '#FFA000';
  };

  const getStatusText = (status) => {
    return status ? 'completed' : 'pending';
  };

  return (
    <Pressable
      style={styles.taskCard}
      onPress={onPress}
    >
      <View style={styles.taskHeader}>
        <Pressable 
          style={styles.statusButton}
          onPress={() => onToggleStatus(task)}
          disabled={updatingTaskId === task.id}
        >
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.status) }]}>
            {task.status && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </View>
          <Text style={styles.taskStatus}>
            {updatingTaskId === task.id ? 'Updating...' : getStatusText(task.status)}
          </Text>
        </Pressable>
      </View>
      <Text style={[
        styles.taskTitle,
        task.status && styles.completedTaskTitle
      ]} numberOfLines={2}>
        {task.title || 'Untitled Task'}
      </Text>
      <Text style={[
        styles.taskDescription,
        task.status && styles.completedTaskDescription
      ]} numberOfLines={2}>
        {task.description || 'No description'}
      </Text>
      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.taskDate}>
            {formatDateTime(task.due_date)}
          </Text>
        </View>
        <View style={styles.taskCategory}>
          <Text style={styles.categoryText}>{task.category?.title || 'Uncategorized'}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  completedTaskDescription: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  taskCategory: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
  },
});

export default TaskCard;
