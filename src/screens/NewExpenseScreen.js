import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import ScreenHeader from '../components/ScreenHeader';

const CATEGORIES = [
  { label: 'General', value: 'general' },
  { label: 'Food', value: 'food' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Travel', value: 'travel' },
  { label: 'Other', value: 'other' }
];

const NewExpenseScreen = ({ navigation, route }) => {
  const editingExpense = route.params?.expense;
  const isEditing = !!editingExpense;

  const [title, setTitle] = useState(editingExpense?.title || '');
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || '');
  const [category, setCategory] = useState(editingExpense?.category || 'general');
  const [selectedDate, setSelectedDate] = useState(() => {
    if (editingExpense?.expense_date) {
      // Parse the date string from backend (format: "Dec 10, 2024")
      const [month, day, year] = editingExpense.expense_date.replace(',', '').split(' ');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        .indexOf(month);
      return new Date(year, monthIndex, parseInt(day));
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [amountError, setAmountError] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    if (!amount.trim() || isNaN(parseFloat(amount))) {
      setAmountError(true);
      return;
    }

    setTitleError(false);
    setAmountError(false);
    setIsLoading(true);

    try {
      const expenseData = {
        title,
        amount: parseFloat(amount),
        category,
        expense_date: selectedDate.toISOString(),
      };

      if (isEditing) {
        await api.updateExpense(editingExpense.id, expenseData);
        navigation.goBack();
      } else {
        await api.createExpense(expenseData);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const rightComponent = (
    <TouchableOpacity 
      onPress={handleSubmit}
      disabled={isLoading}
      style={styles.saveButton}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Icon name="check" size={24} color="#fff" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={isEditing ? 'Update Expense' : 'Add Expense'} 
        onBack={() => navigation.goBack()} 
        rightComponent={rightComponent}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <View style={[styles.inputWrapper, titleError && styles.inputError]}>
                <Icon name="format-title" size={24} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter expense title"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    setTitleError(false);
                  }}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount (৳)</Text>
              <View style={[styles.inputWrapper, amountError && styles.inputError]}>
                <Icon name="currency-bdt" size={24} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    setAmountError(false);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity 
                style={styles.categoryButton}
                onPress={() => {
                  // Show category picker
                }}
              >
                <Icon name="tag" size={24} color="#666" />
                <Text style={styles.categoryText}>{CATEGORIES.find(cat => cat.value === category)?.label || 'Select Category'}</Text>
                <Icon name="chevron-right" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={24} color="#666" />
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                <Icon name="chevron-right" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewExpenseScreen;
