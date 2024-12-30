import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

const NewTaskScreen = ({ navigation, route }) => {
  const editingTask = route.params?.task;
  const isEditing = route.params?.isEditing || false;

  const [taskName, setTaskName] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [category, setCategory] = useState(editingTask?.category_id || null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(
    editingTask ? new Date(editingTask.due_date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mode, setMode] = useState('date');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setIsFetchingCategories(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onDateChange = (event, selectedDate) => {
    if (mode === 'date') {
      setShowDatePicker(false);
      if (selectedDate) {
        const newDateTime = new Date(selectedDate);
        // Preserve the existing time when changing date
        newDateTime.setHours(selectedDate.getHours());
        newDateTime.setMinutes(selectedDate.getMinutes());
        setSelectedDate(newDateTime);
        setMode('time');
        setShowTimePicker(true);
      }
    } else {
      setShowTimePicker(false);
      if (selectedDate) {
        const newDateTime = new Date(selectedDate);
        // Preserve the existing date when changing time
        const currentDate = selectedDate;
        newDateTime.setFullYear(currentDate.getFullYear());
        newDateTime.setMonth(currentDate.getMonth());
        newDateTime.setDate(currentDate.getDate());
        setSelectedDate(newDateTime);
      }
      setMode('date');
    }
  };

  const handleSave = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsLoading(true);
    try {
      const taskData = {
        title: taskName,
        description: description,
        category_id: category,
        due_date: selectedDate.toISOString(),
        status: editingTask?.status || false,
      };

      if (isEditing) {
        await api.updateTask(editingTask.id, taskData);
      } else {
        await api.createTask(taskData);
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} task`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Task' : 'New Task '}
        </Text>
        <View style={{ width: 24 }}>
          <Text>{/* Empty text for layout balance */}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title Task</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add Task Name..."
                value={taskName}
                onChangeText={setTaskName}
                editable={!isLoading}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
              contentContainerStyle={styles.categoryContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textArea]}>
              <TextInput
                style={[styles.input, styles.textAreaInput]}
                placeholder="Add Descriptions..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                editable={!isLoading}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <Pressable
              onPress={() => {
                setMode('date');
                setShowDatePicker(true);
              }}
              style={styles.dateTimeButton}
              disabled={isLoading}
            >
              <Icon name="calendar-clock" size={20} color="#666" style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>
                {formatDate(selectedDate)}
              </Text>
            </Pressable>
            {(showDatePicker || showTimePicker) && (
              <DateTimePicker
                value={selectedDate}
                mode={mode}
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>
        <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isEditing ? 'Update Task' : 'Create Task'}
              </Text>
            )}
        </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align items to the start of the row
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FD',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff', 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 120,
  },
  textAreaInput: {
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginVertical: 8,
  },
  categoryContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4169E1',
    borderColor: '#4169E1',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewTaskScreen;
