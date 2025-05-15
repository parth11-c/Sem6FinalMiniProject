import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { useEffect, useRef } from 'react';

export default function TabLayout() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const colors = themeColors[theme];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleThemeToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleTheme();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.buttonBackground,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#2A3A2A' : '#e5e5e5',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'Poppins-Medium',
          color: colors.text,
        },
        headerShown: true,
        gestureEnabled: false,
        headerLeft: () => null,
        headerTitle: () => (
          <Animated.View style={[styles.headerTitleContainer, { opacity: fadeAnim }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Collab</Text>
              <View style={[styles.titleUnderline, { backgroundColor: colors.buttonBackground }]} />
            </View>
            <View style={styles.rightContainer}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity 
                  style={[
                    styles.themeToggle, 
                    { 
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.buttonBackground,
                    }
                  ]} 
                  onPress={handleThemeToggle}
                >
                  <View style={styles.toggleContent}>
                    <FontAwesome 
                      name={isDarkMode ? "sun-o" : "moon-o"} 
                      size={18} 
                      color={colors.buttonBackground} 
                    />
                    <Text style={[styles.toggleText, { color: colors.buttonBackground }]}>
                      {isDarkMode ? 'Light' : 'Dark'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        ),
        headerStyle: {
          height: 100,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerBackground: () => (
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={[colors.gradient[0], colors.gradient[1]] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />
            <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }]} />
          </View>
        ),
        headerTintColor: colors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome 
              name="home" 
              size={24} 
              color={color} 
              style={{ marginBottom: -3 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notification',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <FontAwesome name="bell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <FontAwesome name="plus" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <FontAwesome name="user" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <FontAwesome name="gear" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  titleUnderline: {
    height: 3,
    width: '50%',
    borderRadius: 2,
    marginTop: 4,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
}); 