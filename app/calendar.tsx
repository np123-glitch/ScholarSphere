// screens/Calendar.tsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define the homework assignment type.
interface HomeworkAssignment {
  id: string;
  text: string;
  dueDate: string; // Format: 'YYYY-MM-DD'
}

export default function HomeworkPlanner() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const isDarkMode = systemColorScheme === 'dark';

  // Set default selected date to today (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignmentText, setAssignmentText] = useState('');
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);

  // Handler for when a day is pressed on the calendar.
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  // Handler to add a new homework assignment.
  const handleAddAssignment = () => {
    if (!assignmentText.trim()) {
      Alert.alert('Validation Error', 'Please enter the assignment name.');
      return;
    }
    const newAssignment: HomeworkAssignment = {
      id: Date.now().toString(),
      text: assignmentText,
      dueDate: selectedDate,
    };

    setAssignments((prev) => {
      return [...prev, newAssignment];
    });
    setAssignmentText('');
    setModalVisible(false);
  };

  // Optionally, sort assignments by due date.
  const sortedAssignments = assignments.sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );

  // Render function for each homework assignment.
  const renderAssignment = ({ item }: { item: HomeworkAssignment }) => (
    <View style={[styles.assignmentItem, isDarkMode && styles.assignmentItemDark]}>
      <ThemedText type="body">{item.text}</ThemedText>
      <ThemedText type="caption" style={styles.dueDateText}>
        Due: {item.dueDate}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.back()}
          accessibilityLabel="Go Back"
        >
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText
          type="title"
          style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}
        >
          Homework Planner
        </ThemedText>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Calendar Component */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: '#007bff' },
        }}
        theme={{
          backgroundColor: isDarkMode ? '#333' : '#fff',
          calendarBackground: isDarkMode ? '#333' : '#fff',
          textSectionTitleColor: isDarkMode ? '#fff' : '#000',
          dayTextColor: isDarkMode ? '#fff' : '#000',
          monthTextColor: isDarkMode ? '#fff' : '#000',
          arrowColor: '#007bff',
          todayTextColor: '#007bff',
        }}
        style={styles.calendar}
      />

      {/* Assignment List */}
      <ThemedView style={styles.assignmentSection}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Homework Assignments
        </ThemedText>
        <FlatList
          data={sortedAssignments}
          keyExtractor={(item) => item.id}
          renderItem={renderAssignment}
          ListEmptyComponent={
            <ThemedText type="body" style={styles.emptyText}>
              No assignments added yet.
            </ThemedText>
          }
        />
        <TouchableOpacity
          style={[styles.addButton, isDarkMode && styles.addButtonDark]}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText type="button" style={styles.addButtonText}>
            Add Homework
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Modal for Adding Homework Assignment */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              New Homework Assignment
            </ThemedText>
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.modalInputDark]}
              value={assignmentText}
              onChangeText={setAssignmentText}
              placeholder="Enter assignment name"
              placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
              multiline
            />
            <ThemedText type="caption" style={styles.modalDueDateText}>
              Due Date: {selectedDate}
            </ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText type="button" style={styles.modalButtonText}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddAssignment}
              >
                <ThemedText type="button" style={styles.modalButtonText}>
                  Save
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  // Calendar
  calendar: {
    borderRadius: 8,
    marginBottom: 16,
  },
  // Assignment Section
  assignmentSection: {
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonDark: {
    backgroundColor: '#0056b3',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignmentItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  assignmentItemDark: {
    backgroundColor: '#555',
  },
  dueDateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '80%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalContainerDark: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
    marginBottom: 16,
  },
  modalInputDark: {
    borderColor: '#555',
    backgroundColor: '#555',
    color: '#fff',
  },
  modalDueDateText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
