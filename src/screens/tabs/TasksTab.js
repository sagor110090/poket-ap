import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable, Text, ScrollView,SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import TaskCard from '../../components/TaskCard';

const TasksTab = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Fetch tasks on initial load
  useEffect(() => {
    fetchTasks();
  }, []);

  // Refresh tasks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {
      const response = await api.getTasks();
      setTasks(response || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(
        (response || [])
          .map(task => task.category?.title || 'Uncategorized')
      ));
      setCategories(['all', ...uniqueCategories]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
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
      <Ionicons name="checkbox-outline" size={64} color="#CCC" />
      <Text style={styles.emptyText}>No tasks yet</Text>
      <Text style={styles.emptySubText}>Tap the + button to add your first task</Text>
    </View>
  );

  const renderTask = ({ item }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('EditTask', { task: item })}
      onToggleStatus={handleToggleStatus}
      updatingTaskId={updatingTaskId}
    />
  );

  const getFilteredTasks = () => {
    if (selectedCategory === 'all') return tasks;
    return tasks.filter(task => 
      (task.category?.title || 'Uncategorized') === selectedCategory
    );
  };

  const renderCategoryChip = (category) => (
    <Pressable
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === category && styles.selectedCategoryChipText
      ]}>
        {category === 'all' ? 'All Tasks' : category}
      </Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
      <SafeAreaView >

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <View style={styles.categoriesWrapper}>
            {categories.map(renderCategoryChip)}
          </View>
        </ScrollView>
        </SafeAreaView>

        <FlatList
          data={getFilteredTasks()}
          renderItem={renderTask}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('NewTask')}
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  categoriesContainer: {
    height: 56,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoriesContent: {
    paddingHorizontal: 8,
  },
  categoriesWrapper: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F5F6F8',
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryChipText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default TasksTab;
