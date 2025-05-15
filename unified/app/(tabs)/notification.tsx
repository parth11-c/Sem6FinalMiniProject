import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

type NotificationItem = {
  id: string;
  type: 'project' | 'message' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export default function NotificationScreen() {
  const { theme, isDarkMode } = useTheme();
  const colors = themeColors[theme];
  const { notifications, markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project':
        return 'briefcase';
      case 'message':
        return 'envelope';
      case 'system':
        return 'cog';
      default:
        return 'bell';
    }
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDarkMode ? '#2A3A2A' : '#E0E0E0',
        }
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32' }
        ]}>
          <FontAwesome name={getNotificationIcon(item.type)} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.message, { color: colors.secondaryText }]}>{item.message}</Text>
          <Text style={[styles.time, { color: colors.secondaryText }]}>{item.time}</Text>
        </View>
        {!item.read && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            Your notifications will be shown here
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  notificationItem: {
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    opacity: 0.7,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 