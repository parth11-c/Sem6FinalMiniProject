import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { useProjects } from '../../context/ProjectContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { theme, isDarkMode } = useTheme();
  const colors = themeColors[theme];
  const { projects } = useProjects();
  const router = useRouter();

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Project not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={[colors.gradient[0], colors.gradient[1]] as [string, string]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>{project.name}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Project Type</Text>
              <Text style={[styles.sectionContent, { color: colors.secondaryText }]}>{project.type}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Project Duration</Text>
              <Text style={[styles.sectionContent, { color: colors.secondaryText }]}>{project.duration}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
              <Text style={[styles.sectionContent, { color: colors.secondaryText }]}>{project.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Technologies Used</Text>
              <View style={styles.tagsContainer}>
                {project.technologies.map((tech, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.tagBackground }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tech Stack</Text>
              <View style={styles.tagsContainer}>
                {project.techStack.map((stack, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.tagBackground }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{stack}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Programming Languages</Text>
              <View style={styles.tagsContainer}>
                {project.languages.map((lang, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.tagBackground }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Members</Text>
              <View style={styles.tagsContainer}>
                {project.groupMembers.map((member, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.tagBackground }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{member}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Project Status</Text>
              <View style={[styles.statusContainer, { 
                backgroundColor: project.status === 'active' 
                  ? (isDarkMode ? '#4CAF50' : '#2E7D32')
                  : (isDarkMode ? '#FF5252' : '#D32F2F')
              }]}>
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
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
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
}); 