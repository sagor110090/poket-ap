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

  // Convert boolean status to string for display
  const status = task.status ? 'completed' : 'pending';

  const getStatusColor = (statusStr) => {
    return statusStr === 'completed' ? '#4CAF50' : '#FFA000';
  };

  const getStatusText = (statusStr) => {
    return statusStr === 'completed' ? 'completed' : 'pending';
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
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]}>
            {status === 'completed' && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </View>
          <Text style={styles.taskStatus}>
            {updatingTaskId === task.id ? 'Updating...' : getStatusText(status)}
          </Text>
        </Pressable>
      </View>
      <Text style={[
        styles.taskTitle,
        status === 'completed' && styles.completedTaskTitle
      ]} numberOfLines={2}>
        {task.title || 'Untitled Task'}
      </Text>
      <Text style={[
        styles.taskDescription,
        status === 'completed' && styles.completedTaskDescription
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  taskStatus: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  completedTaskTitle: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  completedTaskDescription: {
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
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  taskCategory: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#2196F3',
  },
});

export default TaskCard;
