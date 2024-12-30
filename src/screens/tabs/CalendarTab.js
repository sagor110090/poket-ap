import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import TaskCard from '../../components/TaskCard';

const CalendarTab = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [weekDates, setWeekDates] = useState([]);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    generateWeekDates();
  }, []);

  // Refresh tasks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3); // Start from 3 days ago

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  };

  const fetchTasks = async () => {
    try {
      const response = await api.getTasks();
      setTasks(response || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
    };
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, selectedDate);
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleToggleStatus = async (task) => {
    try {
      setUpdatingTaskId(task.id);
      const newStatus = !task.status;
      
      await api.updateTaskStatus(task.id, {
        status: Boolean(newStatus)
      });
      
      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.id === task.id 
            ? { ...t, status: Boolean(newStatus) }
            : t
        )
      );
    } catch (error) {
      console.error('Update task status error:', error);
      await fetchTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#CCC" />
      <Text style={styles.emptyText}>No tasks for this date</Text>
    </View>
  );

  const renderTask = ({ item }) => (
    <TaskCard
      key={item.id}
      task={item}
      onPress={() => navigation.navigate('EditTask', { task: item })}
      onToggleStatus={handleToggleStatus}
      updatingTaskId={updatingTaskId}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      {/* Calendar Strip */}
      <SafeAreaView>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.calendarStrip}
      >
        {weekDates.map((date, index) => (
          <Pressable
            key={index}
            style={[
              styles.dateCard,
              isToday(date) && styles.todayCard,
              isSameDay(date, selectedDate) && styles.selectedDateCard
            ]}
            onPress={() => handleDateSelect(date)}
          >
            <Text style={[
              styles.dayText,
              isToday(date) && styles.todayText,
              isSameDay(date, selectedDate) && styles.selectedText
            ]}>
              {formatDate(date).day}
            </Text>
            <Text style={[
              styles.dateText,
              isToday(date) && styles.todayText,
              isSameDay(date, selectedDate) && styles.selectedText
            ]}>
              {formatDate(date).date}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      </SafeAreaView>
      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.tasksList}
        ListEmptyComponent={renderEmptyList}
      />
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
  },
  calendarStrip: {
    height: 120, // Fixed height for the calendar strip
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateCard: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
  },
  selectedDateCard: {
    backgroundColor: '#2196F3',
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedText: {
    color: 'white',
  },
  todayText: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  tasksList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default CalendarTab;
