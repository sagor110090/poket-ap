import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import ScreenHeader from '../components/ScreenHeader';

const NewExpenseScreen = ({ navigation, route }) => {
  const editingExpense = route.params?.expense;
  const isEditing = !!editingExpense;

  const [title, setTitle] = useState(editingExpense?.title || '');
  const [amount, setAmount] = useState(
    editingExpense?.amount
      ? parseFloat(editingExpense.amount.replace(/,/g, '')).toString()
      : ''
  );
  const [category, setCategory] = useState(editingExpense?.category || '');
  const [categories, setCategories] = useState([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    if (editingExpense?.expense_date) {
      const [month, day, year] = editingExpense.expense_date.replace(',', '').split(' ');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        .indexOf(month);
      return new Date(year, monthIndex, parseInt(day));
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [titleError, setTitleError] = useState(false);
  const [amountError, setAmountError] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getExpenseCategories();
      const validCategories = data.filter(cat => typeof cat === 'string' && cat.trim());
      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) return;
    
    const newCategory = customCategory.trim();
    setCategories(prevCategories => [...prevCategories, newCategory]);
    setCategory(newCategory);
    setCustomCategory('');
    setShowCategoryPicker(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    if (!amount.trim() || isNaN(parseFloat(amount))) {
      setAmountError(true);
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
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
      } else {
        await api.createExpense(expenseData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
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
              await api.deleteExpense(editingExpense.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
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
    <View style={styles.headerButtons}>
      {isEditing && (
        <TouchableOpacity 
          onPress={handleDelete}
          style={[styles.headerButton, styles.deleteButton]}
        >
          <Icon name="trash-can-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        onPress={handleSubmit}
        disabled={isLoading}
        style={[styles.headerButton, styles.saveButton]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="check" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={isEditing ? 'Edit Expense' : 'Add Expense'} 
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
                onPress={() => setShowCategoryPicker(true)}
              >
                <Icon name="tag" size={24} color="#666" />
                <Text style={styles.categoryButtonText}>
                  {category || 'Select Category'}
                </Text>
                <Icon name="chevron-down" size={24} color="#666" />
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

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity 
                onPress={() => setShowCategoryPicker(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.customCategoryContainer}>
              <TextInput
                style={styles.customCategoryInput}
                placeholder="Enter new category"
                value={customCategory}
                onChangeText={setCustomCategory}
              />
              <TouchableOpacity 
                style={[
                  styles.addCustomButton,
                  !customCategory.trim() && styles.addCustomButtonDisabled
                ]}
                onPress={handleAddCustomCategory}
                disabled={!customCategory.trim()}
              >
                <Text style={styles.addCustomButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoryDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or select existing</Text>
              <View style={styles.dividerLine} />
            </View>

            {isCategoryLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
              </View>
            ) : categories.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No categories available</Text>
              </View>
            ) : (
              <ScrollView style={styles.categoriesList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={`category-${cat}`}
                    style={[
                      styles.categoryOption,
                      category === cat && styles.selectedCategory,
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      category === cat && styles.selectedCategoryText,
                    ]}>
                      {cat}
                    </Text>
                    {category === cat && (
                      <Icon name="check" size={20} color="#2196F3" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
  },
  saveButton: {
    backgroundColor: '#2196F3',
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
  categoryButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  customCategoryContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  customCategoryInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  addCustomButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addCustomButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addCustomButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#666',
    fontSize: 12,
  },
  categoriesList: {
    padding: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedCategory: {
    backgroundColor: '#E3F2FD',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
  },
});

export default NewExpenseScreen;
