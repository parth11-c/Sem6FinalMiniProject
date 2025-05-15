import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput, Alert, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    marginBottom: 15,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  section: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionContent: {
    paddingLeft: 10,
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 10,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillPill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  skillText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    width: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  arrayItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  saveButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default function ProfileScreen() {
  const { theme, isDarkMode } = useTheme();
  const colors = themeColors[theme];
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const [originalProfileData, setOriginalProfileData] = useState({
    name: '',
    title: '',
    course: '',
    specialization: '',
    graduation: '',
    frontend: '',
    backend: '',
    database: '',
    devops: '',
    languages: [''],
    skills: ['']
  });
  const [profileData, setProfileData] = useState(originalProfileData);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        setOriginalProfileData(parsedProfile);
        setProfileData(parsedProfile);
        setIsProfileCreated(true);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRefs.current['name']?.focus();
    }, 100);
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      setOriginalProfileData(profileData);
      setIsEditing(false);
      setIsProfileCreated(true);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    setProfileData(originalProfileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayItemChange = (arrayName: 'languages' | 'skills', index: number, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (arrayName: 'languages' | 'skills') => {
    setProfileData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (arrayName: 'languages' | 'skills', index: number) => {
    setProfileData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const EditableText = ({ value, field, style, multiline = false }: { value: string, field: keyof typeof profileData, style: any, multiline?: boolean }) => {
    return isEditing ? (
      <TextInput
        ref={ref => { inputRefs.current[field] = ref; }}
        style={[style, styles.input, { 
          color: colors.text,
          backgroundColor: colors.cardBackground,
          borderColor: colors.text,
          minHeight: multiline ? 80 : 40,
          textAlignVertical: multiline ? 'top' : 'center'
        }]}
        value={value}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholderTextColor={colors.secondaryText}
        multiline={multiline}
        placeholder={`Enter ${field}`}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        blurOnSubmit={false}
        returnKeyType="next"
        keyboardType={field === 'graduation' ? 'number-pad' : 'default'}
        onFocus={() => {
          // Ensure the input is visible when focused
          if (inputRefs.current[field]) {
            scrollViewRef.current?.scrollToFocusedInput(inputRefs.current[field]!);
          }
        }}
        onSubmitEditing={() => {
          const fields = Object.keys(profileData);
          const currentIndex = fields.indexOf(field as string);
          if (currentIndex < fields.length - 1) {
            const nextField = fields[currentIndex + 1];
            inputRefs.current[nextField]?.focus();
          }
        }}
      />
    ) : (
      <Text style={[style, { color: colors.text }]}>{value}</Text>
    );
  };

  const EditableArrayItem = ({ value, field, index, style }: { value: string, field: 'languages' | 'skills', index: number, style: any }) => {
    const inputKey = `${field}[${index}]`;
    return isEditing ? (
      <TextInput
        ref={ref => { inputRefs.current[inputKey] = ref; }}
        style={[style, styles.input, { 
          color: colors.text,
          backgroundColor: colors.cardBackground,
          borderColor: colors.text,
          minHeight: 40,
          textAlignVertical: 'center'
        }]}
        value={value}
        onChangeText={(text) => handleArrayItemChange(field, index, text)}
        placeholderTextColor={colors.secondaryText}
        placeholder={`Enter ${field}`}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        blurOnSubmit={false}
        returnKeyType="next"
        onFocus={() => {
          // Ensure the input is visible when focused
          if (inputRefs.current[inputKey]) {
            scrollViewRef.current?.scrollToFocusedInput(inputRefs.current[inputKey]!);
          }
        }}
        onSubmitEditing={() => {
          const items = profileData[field];
          if (index < items.length - 1) {
            inputRefs.current[`${field}[${index + 1}]`]?.focus();
          }
        }}
      />
    ) : (
      <Text style={[style, { color: colors.text }]}>{value}</Text>
    );
  };

  if (!isProfileCreated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === 'ios' ? 0 : 20}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome! Let's create your profile</Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.secondaryText}
              value={profileData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Title (e.g., Software Developer)"
              placeholderTextColor={colors.secondaryText}
              value={profileData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Education</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Course"
              placeholderTextColor={colors.secondaryText}
              value={profileData.course}
              onChangeText={(text) => handleInputChange('course', text)}
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Specialization"
              placeholderTextColor={colors.secondaryText}
              value={profileData.specialization}
              onChangeText={(text) => handleInputChange('specialization', text)}
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Graduation Year"
              placeholderTextColor={colors.secondaryText}
              value={profileData.graduation}
              onChangeText={(text) => handleInputChange('graduation', text)}
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tech Stack</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Frontend Technologies"
              placeholderTextColor={colors.secondaryText}
              value={profileData.frontend}
              onChangeText={(text) => handleInputChange('frontend', text)}
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Backend Technologies"
              placeholderTextColor={colors.secondaryText}
              value={profileData.backend}
              onChangeText={(text) => handleInputChange('backend', text)}
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="Database Technologies"
              placeholderTextColor={colors.secondaryText}
              value={profileData.database}
              onChangeText={(text) => handleInputChange('database', text)}
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
              placeholder="DevOps Tools"
              placeholderTextColor={colors.secondaryText}
              value={profileData.devops}
              onChangeText={(text) => handleInputChange('devops', text)}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Programming Languages</Text>
            {profileData.languages.map((language, index) => (
              <View key={index} style={styles.arrayItemContainer}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
                  placeholder={`Language ${index + 1}`}
                  placeholderTextColor={colors.secondaryText}
                  value={language}
                  onChangeText={(text) => handleArrayItemChange('languages', index, text)}
                />
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: colors.buttonBackground }]}
                  onPress={() => removeArrayItem('languages', index)}
                >
                  <Ionicons name="remove-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.buttonBackground }]}
              onPress={() => addArrayItem('languages')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Language</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills</Text>
            {profileData.skills.map((skill, index) => (
              <View key={index} style={styles.arrayItemContainer}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.text }]}
                  placeholder={`Skill ${index + 1}`}
                  placeholderTextColor={colors.secondaryText}
                  value={skill}
                  onChangeText={(text) => handleArrayItemChange('skills', index, text)}
                />
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: colors.buttonBackground }]}
                  onPress={() => removeArrayItem('skills', index)}
                >
                  <Ionicons name="remove-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.buttonBackground }]}
              onPress={() => addArrayItem('skills')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Skill</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.buttonBackground }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Create Profile</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 0 : 20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: isDarkMode ? '#2A3A2A' : '#e0e0e0' }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
          </View>
          <EditableText value={profileData.name} field="name" style={styles.name} />
          <EditableText value={profileData.title} field="title" style={styles.title} />
          <View style={styles.socialLinks}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.tagBackground }]}>
              <Ionicons name="logo-github" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.tagBackground }]}>
              <Ionicons name="logo-linkedin" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.tagBackground }]}>
              <Ionicons name="logo-instagram" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Specialization */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.buttonBackground }]}>
              <Ionicons name="school-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Specialization</Text>
          </View>
          <View style={styles.sectionContent}>
            <EditableText value={profileData.course} field="course" style={styles.sectionText} />
            <EditableText value={profileData.specialization} field="specialization" style={styles.sectionText} />
            <EditableText value={profileData.graduation} field="graduation" style={styles.sectionText} />
          </View>
        </View>

        {/* Tech Stack */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.buttonBackground }]}>
              <Ionicons name="code-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tech Stack</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.skillContainer}>
              <View style={[styles.skillPill, { backgroundColor: colors.tagBackground }]}>
                <EditableText value={profileData.frontend} field="frontend" style={styles.skillText} />
              </View>
              <View style={[styles.skillPill, { backgroundColor: colors.tagBackground }]}>
                <EditableText value={profileData.backend} field="backend" style={styles.skillText} />
              </View>
              <View style={[styles.skillPill, { backgroundColor: colors.tagBackground }]}>
                <EditableText value={profileData.database} field="database" style={styles.skillText} />
              </View>
              <View style={[styles.skillPill, { backgroundColor: colors.tagBackground }]}>
                <EditableText value={profileData.devops} field="devops" style={styles.skillText} />
              </View>
            </View>
          </View>
        </View>

        {/* Programming Languages */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.buttonBackground }]}>
              <Ionicons name="logo-javascript" size={24} color="#fff" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Programming Languages</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.skillContainer}>
              {profileData.languages.map((language, index) => (
                <View key={index} style={[styles.skillPill, { backgroundColor: colors.tagBackground }]}>
                  <EditableArrayItem 
                    value={language} 
                    field="languages"
                    index={index} 
                    style={styles.skillText} 
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Skills */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.buttonBackground }]}>
              <Ionicons name="construct-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.skillContainer}>
              {profileData.skills.map((skill, index) => (
                <View key={index} style={[styles.skillPill, { backgroundColor: colors.tagBackground }]}>
                  <EditableArrayItem 
                    value={skill} 
                    field="skills"
                    index={index} 
                    style={styles.skillText} 
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Floating Action Buttons */}
      {isEditing ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} 
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#F44336' }]} 
            onPress={handleCancel}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: colors.buttonBackground }]} 
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
} 