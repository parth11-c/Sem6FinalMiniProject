import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { useProjects } from '../../context/ProjectContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectsScreen() {
  const { theme, isDarkMode } = useTheme();
  const colors = themeColors[theme];
  const { projects } = useProjects();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || project.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const categories = Array.from(new Set(projects.map(p => p.category)));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={[colors.gradient[0], colors.gradient[1]] as [string, string]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>All Projects</Text>
          </View>

          {/* Search Bar */}
          <BlurView 
            intensity={80} 
            tint={isDarkMode ? "dark" : "light"} 
            style={[styles.searchContainer, { backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}
          >
            <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search projects..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BlurView>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedCategory && { backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32' }
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryButtonText,
                !selectedCategory && { color: '#FFFFFF' }
              ]}>All</Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && { backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32' }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && { color: '#FFFFFF' }
                ]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Projects List */}
          <ScrollView 
            style={styles.projectsList}
            contentContainerStyle={styles.projectsListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredProjects.map((project) => (
              <TouchableOpacity 
                key={project.id} 
                style={[styles.projectCard, { 
                  backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: isDarkMode ? '#2A3A2A' : '#E0E0E0',
                  borderWidth: 1,
                }]}
                activeOpacity={0.9}
                onPress={() => router.push({
                  pathname: "/project/[id]",
                  params: { id: project.id }
                } as any)}
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
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  categoriesScroll: {
    marginBottom: 16,
    maxHeight: 40,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  projectsList: {
    flex: 1,
  },
  projectsListContent: {
    paddingBottom: 20,
  },
  projectCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
    marginRight: 8,
  },
  projectTitle: {
    fontSize: 18,
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
    marginBottom: 12,
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
}); 