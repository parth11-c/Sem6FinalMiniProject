import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const colors = themeColors[theme];
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const SettingItem = ({ icon, title, rightComponent, onPress }: { icon: string, title: string, rightComponent?: React.ReactNode, onPress?: () => void }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#2A3A2A' : 'rgba(0,0,0,0.05)' }]}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon as any} size={24} color={colors.secondaryText} />
        <Text style={[styles.settingItemText, { color: colors.text }]}>{title}</Text>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: isDarkMode ? '#2A3A2A' : '#eee' }]}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Notifications</Text>
          <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={[styles.sectionContent, { backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}>
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#767577', true: colors.buttonBackground }}
                  thumbColor={notifications ? '#f5dd4b' : '#f4f3f4'}
                />
              }
            />
            <SettingItem
              icon="volume-high-outline"
              title="Sound Effects"
              rightComponent={
                <Switch
                  value={soundEffects}
                  onValueChange={setSoundEffects}
                  trackColor={{ false: '#767577', true: colors.buttonBackground }}
                  thumbColor={soundEffects ? '#f5dd4b' : '#f4f3f4'}
                />
              }
            />
          </BlurView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Appearance</Text>
          <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={[styles.sectionContent, { backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}>
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              rightComponent={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: colors.buttonBackground }}
                  thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
                />
              }
            />
          </BlurView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Account</Text>
          <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={[styles.sectionContent, { backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}>
            <SettingItem
              icon="person-outline"
              title="Profile"
              rightComponent={<Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy"
              rightComponent={<Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />}
            />
            <SettingItem
              icon="log-out-outline"
              title="Sign Out"
              rightComponent={<Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />}
              onPress={handleSignOut}
            />
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 