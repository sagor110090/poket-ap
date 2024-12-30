import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

const EditTaskScreen = ({ navigation, route }) => {
  const task = route.params?.task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState(task?.category_id?.toString() || '');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [titleError, setTitleError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    task?.due_date ? new Date(task.due_date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mode, setMode] = useState('date');

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#F8F9FD');
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response);
      if (!category && response && response.length > 0) {
        setCategory(response[0].id.toString());
      }
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
        const currentDate = selectedDate;
        newDateTime.setFullYear(currentDate.getFullYear());
        newDateTime.setMonth(currentDate.getMonth());
        newDateTime.setDate(currentDate.getDate());
        setSelectedDate(newDateTime);
      }
      setMode('date');
    }
  };

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);

    setIsLoading(true);
    try {
      await api.updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        category_id: category,
        due_date: selectedDate.toISOString(),
        status: task.status,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
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
            setIsLoading(true);
            try {
              await api.deleteTask(task.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteTask}
              disabled={isLoading}
            >
              <Icon name="delete-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, (!title.trim() || isLoading) && styles.saveButtonDisabled]}
              onPress={handleUpdateTask}
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Icon name="check" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Task Title</Text>
              <View style={[styles.inputContainer, titleError && styles.inputError]}>
                <Icon name="format-title" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="What needs to be done?"
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    setTitleError(false);
                  }}
                  maxLength={100}
                />
              </View>
              {titleError && (
                <Text style={styles.errorText}>Please enter a task title</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Add details about your task..."
                  placeholderTextColor="#999"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                onPress={() => {
                  setMode('date');
                  setShowDatePicker(true);
                }}
                style={styles.datePickerButton}
                disabled={isLoading}
              >
                <Icon name="calendar-clock" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.datePickerText}>{formatDate(selectedDate)}</Text>
                <Icon name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
              {(showDatePicker || showTimePicker) && (
                <DateTimePicker
                  value={selectedDate}
                  mode={mode}
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              {isFetchingCategories ? (
                <ActivityIndicator color="#4169E1" style={styles.categoryLoader} />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        category === cat.id.toString() && styles.categoryButtonActive,
                      ]}
                      onPress={() => setCategory(cat.id.toString())}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          category === cat.id.toString() && styles.categoryTextActive,
                        ]}
                      >
                        {cat.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#4169E1',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4169E1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#B0C4DE',
    shadowOpacity: 0,
    elevation: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  textAreaContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  textArea: {
    height: 100,
    fontSize: 16,
    color: '#1A1A1A',
    textAlignVertical: 'top',
  },
  categoryLoader: {
    marginTop: 12,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryButtonActive: {
    backgroundColor: '#4169E1',
    borderColor: '#4169E1',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
  },
});

export default EditTaskScreen;
