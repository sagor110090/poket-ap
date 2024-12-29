import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

// Schedule task reminder notification
export const scheduleTaskReminder = async (task) => {
  try {
    const { id, title, due_date, status } = task;
    
    // If task is completed, cancel any existing notifications
    if (status) {
      await cancelTaskNotification(id);
      return;
    }

    const dueDate = new Date(due_date);
    const now = new Date();
    
    // Calculate time difference in minutes
    const timeDifferenceInMinutes = Math.floor((dueDate - now) / (1000 * 60));

    // Cancel any existing notifications for this task
    await cancelTaskNotification(id);

    // If due date has passed, don't schedule notification
    if (timeDifferenceInMinutes < 0) {
      return;
    }

    // Format the due time for the message
    const dueTimeStr = dueDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // If due in less than 30 minutes, show notification immediately
    if (timeDifferenceInMinutes <= 30) {
      console.log('Scheduling immediate notification for task:', title);
      await Notifications.scheduleNotificationAsync({
        identifier: `task-${id}`,
        content: {
          title: 'Task Due Soon!',
          body: `Your task "${title}" is due at ${dueTimeStr} (in ${timeDifferenceInMinutes} minutes)`,
          data: { taskId: id },
        },
        trigger: null, // Show immediately
      });
    } else {
      // Calculate exact notification time (30 minutes before due time)
      const notificationTime = new Date(dueDate.getTime() - (30 * 60 * 1000));
      
      console.log('Scheduling future notification for task:', title);
      console.log('Due date:', dueDate.toISOString());
      console.log('Notification time:', notificationTime.toISOString());
      
      await Notifications.scheduleNotificationAsync({
        identifier: `task-${id}`,
        content: {
          title: 'Task Due Soon!',
          body: `Your task "${title}" is due at ${dueTimeStr} (in 30 minutes)`,
          data: { taskId: id },
        },
        trigger: {
          date: notificationTime,
          seconds: 1, // Ensure the trigger is set properly
        },
      });
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Cancel task notification
export const cancelTaskNotification = async (taskId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};
