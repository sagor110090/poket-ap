import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTaskTab, setActiveTaskTab] = useState('inProgress');
  const [expenses, setExpenses] = useState([]); 
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tasksResponse, categoriesResponse, expensesResponse] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
        api.getExpenses()
      ]);
      setTasks(tasksResponse);
      setCategories([
        { id: null, title: 'All Tasks' },
        ...categoriesResponse
      ]);
      setExpenses(expensesResponse);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUserName();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      setUserName(name || 'User');
    } catch (error) {
      console.log('Error loading user name:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    setIsUpdating(true);
    try {
      const newStatus = !currentStatus;
      await api.updateTaskStatus(taskId, newStatus);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );
      Alert.alert('Success', `Task marked as ${newStatus ? 'completed' : 'incomplete'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditTask = (task) => {
    navigation.navigate('NewTask', { task, isEditing: true });
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await api.deleteTask(taskId);
              setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
              console.error('Delete task error:', error);
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getFilteredTasks = () => {
    // First filter by category if one is selected
    let filtered = selectedCategory 
      ? tasks.filter(task => task.category_id === selectedCategory)
      : tasks;
    
    // Then filter by status based on active tab
    filtered = filtered.filter(task => 
      activeTaskTab === 'inProgress' ? !task.status : task.status
    );

    return filtered;
  };

  const getTaskCounts = () => {
    const filteredTasks = selectedCategory 
      ? tasks.filter(task => task.category_id === selectedCategory)
      : tasks;

    return {
      inProgress: filteredTasks.filter(task => !task.status).length,
      completed: filteredTasks.filter(task => task.status).length
    };
  };

  const taskCount = getTaskCounts();

  const TaskCard = ({ task }) => {
    const handleStatusChange = async () => {
      setIsUpdating(true);
      try {
        await api.updateTaskStatus(task.id, !task.status);
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === task.id
              ? { ...t, status: !task.status }
              : t
          )
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to update task status');
      } finally {
        setIsUpdating(false);
      }
    };

    const handleDelete = () => {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setIsUpdating(true);
              try {
                await api.deleteTask(task.id);
                setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
              } catch (error) {
                Alert.alert('Error', 'Failed to delete task');
              } finally {
                setIsUpdating(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    };

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('NewTask', { task, isEditing: true })}
        activeOpacity={0.7}
      >
        <View style={[
          styles.taskCard,
          task.status && styles.taskCardCompleted
        ]}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleStatusChange();
            }}
            style={styles.statusButton}
          >
            <View style={[styles.statusCircle, task.status && styles.statusCircleCompleted]}>
              {task.status && <Icon name="check" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
          <View style={styles.taskContent}>
            <Text style={[
              styles.taskTitle,
              task.status && styles.taskTitleCompleted
            ]}>{task.title}</Text>
            <Text style={[
              styles.taskDescription,
              task.status && styles.taskDescriptionCompleted
            ]}>{task.description}</Text>
            <View style={styles.taskMeta}>
              <Text style={[
                styles.taskDate,
                task.status && styles.taskDateCompleted
              ]}>{new Date(task.due_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}</Text>
            </View>
          </View>
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={styles.deleteButton}
            >
              <Icon name="trash-can-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FD" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Icon name="logout" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{taskCount.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={styles.statNumber}>{taskCount.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.categorySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.categoryItemActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTaskTab === 'inProgress' && styles.activeTab
            ]}
            onPress={() => setActiveTaskTab('inProgress')}
          >
            <Text style={[
              styles.tabText,
              activeTaskTab === 'inProgress' && styles.activeTabText
            ]}>
              In Progress ({taskCount.inProgress})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTaskTab === 'completed' && styles.activeTab
            ]}
            onPress={() => setActiveTaskTab('completed')}
          >
            <Text style={[
              styles.tabText,
              activeTaskTab === 'completed' && styles.activeTabText
            ]}>
              Completed ({taskCount.completed})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : getFilteredTasks().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTaskTab === 'inProgress' 
                  ? 'No tasks in progress' 
                  : 'No completed tasks'}
              </Text>
              {selectedCategory && (
                <Text style={styles.emptySubText}>
                  Try selecting a different category
                </Text>
              )}
            </View>
          ) : (
            getFilteredTasks().map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('NewTask')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F2F2F7',
    marginHorizontal: 15,
    paddingHorizontal: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryItem: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 90,
    alignItems: 'center',
  },
  categoryItemActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  taskCardCompleted: {
    borderLeftColor: '#34C759',
    backgroundColor: '#F8F8F8',
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: '#8E8E93',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskDescriptionCompleted: {
    color: '#8E8E93',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  taskDateCompleted: {
    color: '#C7C7CC',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusButton: {
    padding: 8,
    marginRight: 4,
  },
  statusCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusCircleCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});

export default HomeScreen;
