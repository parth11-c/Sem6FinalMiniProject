import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { useState, useRef } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useRouter } from 'expo-router';

interface Category {
  id: number;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function HomeScreen() {
  const { theme, isDarkMode } = useTheme();
  const colors = themeColors[theme];
  const { projects } = useProjects();
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const filteredProjects = selectedCategory
    ? projects.filter(project => project.category === selectedCategory)
    : projects;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Animated.ScrollView 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome back,</Text>
              <Text style={[styles.userName, { color: colors.text }]}>Parth!</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(46, 125, 50, 0.1)' }]}
                onPress={() => router.push('/users')}
              >
                <Ionicons name="people" size={24} color={isDarkMode ? '#4CAF50' : '#2E7D32'} />
                <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Collaborator</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(46, 125, 50, 0.1)' }]}
                onPress={() => router.push({ pathname: '/project/projects' }) }
              >
                <Ionicons name="folder" size={24} color={isDarkMode ? '#4CAF50' : '#2E7D32'} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{projects.length}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Projects</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(46, 125, 50, 0.1)' }]}
                onPress={() => router.push('/(tabs)/notification')}
              >
                <Ionicons name="notifications" size={24} color={isDarkMode ? '#4CAF50' : '#2E7D32'} />
                <Text style={[styles.statNumber, { color: colors.text }]}>3</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Updates</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32' }]}
                activeOpacity={0.8}
                onPress={() => router.push('/post')}
              >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>New Project</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(46, 125, 50, 0.1)' }]}
                activeOpacity={0.8}
                onPress={() => router.push('/users')}
              >
                <Ionicons name="search" size={24} color={isDarkMode ? '#4CAF50' : '#2E7D32'} />
                <Text style={[styles.actionButtonText, { color: isDarkMode ? '#4CAF50' : '#2E7D32' }]}>Find Team</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plagiarism Check Button */}
          <TouchableOpacity 
            style={[styles.plagiarismButton, { 
              backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32',
              shadowColor: isDarkMode ? '#4CAF50' : '#2E7D32',
            }]}
            activeOpacity={0.8}
            onPress={() => router.push('/plagiarism')}
          >
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            <Text style={styles.plagiarismButtonText}>Plagiarism Check</Text>
          </TouchableOpacity>

          {/* Project Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Project Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.featuredScroll}
              contentContainerStyle={styles.featuredScrollContent}
              bounces={false}
            >
              {[
                { id: 1, name: 'AI & ML', icon: 'analytics' as const },
                { id: 2, name: 'Cloud', icon: 'cloud' as const },
                { id: 3, name: 'Web Dev', icon: 'globe' as const },
                { id: 4, name: 'Mobile', icon: 'phone-portrait' as const },
                { id: 5, name: 'Data Science', icon: 'bar-chart' as const },
                { id: 6, name: 'DevOps', icon: 'code' as const }
              ].map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.name && {
                      borderWidth: 2,
                      borderColor: isDarkMode ? '#4CAF50' : '#2E7D32',
                    }
                  ]}
                  activeOpacity={0.9}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )}
                >
                  <LinearGradient
                    colors={isDarkMode 
                      ? ['#2A3A2A', '#1A2A1A'] 
                      : ['#4CAF50', '#2E7D32']}
                    style={styles.categoryGradient}
                  >
                    <View style={styles.categoryContent}>
                      <Ionicons name={category.icon} size={32} color="#FFFFFF" />
                      <Text style={styles.categoryTitle}>{category.name}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recent Projects */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedCategory ? `${selectedCategory} Projects` : 'Recent Projects'}
            </Text>
            {filteredProjects.map((project) => (
              <TouchableOpacity 
                key={project.id} 
                style={[styles.projectCard, { 
                  backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: isDarkMode ? '#2A3A2A' : '#E0E0E0',
                  borderWidth: 1,
                }]}
                activeOpacity={0.9}
              >
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleContainer}>
                    <Text style={[styles.projectTitle, { color: colors.text }]}>{project.name}</Text>
                    <Text style={[styles.projectDate, { color: colors.secondaryText }]}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.projectStatus, { 
                    backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32',
                  }]}>
                    <Text style={styles.projectStatusText}>{project.status}</Text>
                  </View>
                </View>
                <Text style={[styles.projectDescription, { color: colors.secondaryText }]}>
                  {project.description}
                </Text>
                <View style={styles.projectFooter}>
                  <View style={styles.projectTags}>
                    {project.tags.map((tag, index) => (
                      <Text key={index} style={[styles.projectTag, { 
                        backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(46, 125, 50, 0.1)',
                        color: isDarkMode ? '#4CAF50' : '#2E7D32',
                      }]}>{tag}</Text>
                    ))}
                  </View>
                  <TouchableOpacity 
                    style={[styles.viewButton, { 
                      backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32',
                    }]}
                    activeOpacity={0.8}
                    onPress={() => router.push({pathname: "/project/[id]", params: { id: project.id }} as any)}
                  >
                    <Text style={[styles.viewButtonText, { color: '#FFFFFF' }]}>View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
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
  scrollContent: {
    paddingTop: 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  featuredScroll: {
    marginHorizontal: -20,
  },
  featuredScrollContent: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: 120,
    height: 120,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryGradient: {
    flex: 1,
  },
  categoryContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  projectCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitleContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  projectDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  projectStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  projectDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  projectTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  viewButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  plagiarismButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  plagiarismButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  heroSection: {
    marginBottom: 24,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
}); 