import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator, Dimensions, Image, Platform, Alert, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { useProjects } from '../../context/ProjectContext';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { BlurView } from 'expo-blur';
import { API_BASE_URL } from '../../constants/api';

// Add custom type definitions
interface CustomThemeColors {
  primary: string;
  error: string;
  background: string;
  text: string;
  secondaryText: string;
  cardBackground: string;
  searchBackground: string;
  buttonBackground: string;
  buttonText: string;
  tagBackground: string;
  gradient: string[];
  [key: string]: string | string[];
}

interface CustomDocument {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  type: 'success';
}

type DocumentIconName = 'document-text' | 'document' | 'grid' | 'easel' | 'image' | 'archive' | 'document-attach';

const CATEGORIES = [
  { id: 1, name: 'AI & ML', icon: 'analytics' as const },
  { id: 2, name: 'Cloud', icon: 'cloud' as const },
  { id: 3, name: 'Web Dev', icon: 'globe' as const },
  { id: 4, name: 'Mobile', icon: 'phone-portrait' as const },
  { id: 5, name: 'Data Science', icon: 'bar-chart' as const },
  { id: 6, name: 'DevOps', icon: 'code' as const }
];

interface DocumentPickerAsset {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

interface DocumentPickerResult {
  assets: Array<{
    uri: string;
    name: string;
    mimeType: string;
    size: number;
  }> | null;
  canceled: boolean;
}

export default function CreateScreen() {
  const { theme, isDarkMode } = useTheme();
  const colors = themeColors[theme] as CustomThemeColors;
  const { addProject } = useProjects();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [techStack, setTechStack] = useState('');
  const [languages, setLanguages] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [projectDuration, setProjectDuration] = useState('');
  const [projectType, setProjectType] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [document, setDocument] = useState<CustomDocument | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentSize, setDocumentSize] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentMimeType, setDocumentMimeType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  };

  const getDocumentIcon = (fileType: string, mimeType: string): DocumentIconName => {
    if (mimeType) {
      if (mimeType.includes('pdf')) return 'document-text';
      if (mimeType.includes('word')) return 'document';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'grid';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'easel';
      if (mimeType.includes('image')) return 'image';
    }
    const type = fileType.toLowerCase();
    if (type === 'pdf') return 'document-text';
    if (['doc', 'docx'].includes(type)) return 'document';
    if (['xls', 'xlsx'].includes(type)) return 'grid';
    if (['ppt', 'pptx'].includes(type)) return 'easel';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) return 'image';
    if (['zip', 'rar'].includes(type)) return 'archive';
    return 'document-attach';
  };

  const uploadDocument = async (fileUri: string, fileName: string, fileType: string) => {
    try {
      // Verify file exists and is readable
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log('File info before upload:', JSON.stringify(fileInfo, null, 2));

      if (!fileInfo.exists) {
        throw new Error('Selected file does not exist in the cache directory');
      }

      if (!fileInfo.size || fileInfo.size === 0) {
        throw new Error('Selected file is empty');
      }

      // Read file content to verify it's accessible
      console.log('Attempting to read file content...');
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('File content read successfully, length:', fileContent.length);

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType
      } as any);

      console.log('Uploading file to server...', {
        uri: fileUri,
        name: fileName,
        type: fileType
      });

      // Make the upload request with timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(`${API_BASE_URL}/files/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server response error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData.error || `Server returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Upload successful:', result);
        return result;
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Upload request timed out after 30 seconds');
          }
          console.error('Network error details:', {
            error: error.message,
            type: error.name,
            stack: error.stack
          });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error uploading document. API_BASE_URL:', API_BASE_URL, 'Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  };

  const pickDocument = async () => {
    try {
      console.log('Starting document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      }) as DocumentPickerResult;

      console.log('Document picker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Verify all required properties exist
        if (!asset.uri || !asset.name || !asset.size || !asset.mimeType) {
          throw new Error('Invalid document selected: missing required properties');
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
          // Verify file exists before proceeding
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          console.log('File info after selection:', JSON.stringify(fileInfo, null, 2));

          if (!fileInfo.exists) {
            throw new Error('Selected file does not exist in the cache directory');
          }

          // Try to read a small portion of the file to verify access
          try {
            const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.Base64,
              length: 100, // Read just the first 100 bytes to verify access
              position: 0,
            });
            console.log('Successfully verified file access, first 100 bytes read');
          } catch (readError) {
            console.error('Error reading file:', readError);
            throw new Error('Could not read the selected file. Please try another file.');
          }

          const fileSize = formatFileSize(asset.size);
          const fileType = getFileExtension(asset.name).toUpperCase();

          // Start upload progress simulation
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 5;
            if (progress <= 90) {
              setUploadProgress(progress);
            }
          }, 100);

          try {
            // Actually upload the file
            const uploadResult = await uploadDocument(asset.uri, asset.name, asset.mimeType);
            
            // Complete the progress
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            // Create a CustomDocument object from the result
            const customDoc: CustomDocument = {
              uri: asset.uri,
              name: asset.name,
              mimeType: asset.mimeType,
              size: asset.size,
              type: 'success'
            };
            
            setDocument(customDoc);
            setDocumentName(asset.name);
            setDocumentSize(fileSize);
            setDocumentType(fileType);
            setDocumentMimeType(asset.mimeType);
            
            // Update the document URL from the server response
            if (uploadResult && uploadResult.url) {
              customDoc.uri = `${API_BASE_URL}${uploadResult.url}`;
            }

            console.log('Document upload completed successfully');
          } catch (uploadError) {
            clearInterval(progressInterval);
            // Log the detailed error from uploadDocument
            console.error('Upload process failed:', JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError)));
            throw uploadError; // Re-throw to be caught by the outer catch
          }
        } catch (error) {
          console.error('Error during document processing or upload initiation:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
          let errorMessage = 'Failed to upload document. ';
          
          if (error instanceof Error) {
            if (error.message.includes('does not exist')) {
              errorMessage += 'The selected file could not be found. Please try selecting the file again.';
            } else if (error.message.includes('empty')) {
              errorMessage += 'The selected file is empty. Please select a different file.';
            } else if (error.message.includes('Failed to upload')) {
              errorMessage += 'Failed to upload to server. Please try again.';
            } else {
              errorMessage += error.message;
            }
          }
          
          Alert.alert('Error', errorMessage);
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      } else {
        console.log('Document selection cancelled');
      }
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert(
        'Error',
        'Failed to pick document. Please make sure the file is not corrupted and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePost = async () => {
    if (!projectName.trim() || !projectDetails.trim() || !category) {
      Alert.alert('Missing Information', 'Please fill in the project name, details, and category.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let documentUrl = '';
      let documentNameToSave = '';
      
      if (document) {
        documentUrl = document.uri;
        documentNameToSave = documentName;
      }

      // Add the project
      await addProject({
        name: projectName.trim(),
        description: projectDetails.trim(),
        status: 'active',
        technologies: technologies.trim().split(',').map(tech => tech.trim()),
        techStack: techStack.trim().split(',').map(stack => stack.trim()),
        languages: languages.trim().split(',').map(lang => lang.trim()),
        groupMembers: groupMembers.trim().split(',').map(member => member.trim()),
        duration: projectDuration.trim(),
        type: projectType.trim(),
        category: category,
        tags: ['React Native', 'Expo'],
        documentUrl: documentUrl,
        documentName: documentNameToSave,
      });

      // Add a notification
      addNotification({
        type: 'project',
        title: 'New Project Created',
        message: `You have created a new project: ${projectName.trim()}`,
        time: 'Just now',
      });
      
      // Reset form
      setProjectName('');
      setProjectDetails('');
      setTechnologies('');
      setTechStack('');
      setLanguages('');
      setGroupMembers('');
      setProjectDuration('');
      setProjectType('');
      setCategory('');
      setDocument(null);
      setDocumentName('');
      setDocumentSize('');
      setDocumentType('');
      
      // Navigate back to home
      router.back();
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadProgress = () => {
    return (
      <View style={[styles.uploadProgressContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.uploadProgressContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.uploadProgressText, { color: colors.text }]}>
            Uploading Document... {uploadProgress}%
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: colors.primary,
                  width: `${uploadProgress}%` 
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  const renderDocumentPreview = () => {
    if (!document) return null;

    if (documentMimeType?.includes('image')) {
      return (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: document.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      );
    }

    // For PDFs and other documents
    return (
      <View style={styles.previewContainer}>
        <WebView
          source={{ uri: document.uri }}
          style={styles.previewWebView}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          startInLoadingState={true}
        />
      </View>
    );
  };

  const viewDocument = async () => {
    if (document && document.uri) {
      try {
        await WebBrowser.openBrowserAsync(document.uri);
      } catch (error) {
        console.error('Error opening document:', error);
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={[colors.gradient[0], colors.gradient[1]] as [string, string]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.headerContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Create Project Post</Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Share your project with the community</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Project Name"
                placeholderTextColor={colors.secondaryText}
                value={projectName}
                onChangeText={setProjectName}
              />

              <TouchableOpacity
                style={[styles.categoryButton, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                }]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.categoryButtonText, { color: category ? colors.text : colors.secondaryText }]}>
                  {category || 'Select Project Category'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.secondaryText} />
              </TouchableOpacity>

              <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
              >
                <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                  <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
                      <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.categoryList}>
                      {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryItem,
                            category === cat.name && { backgroundColor: isDarkMode ? '#2A3A2A' : '#E0E0E0' }
                          ]}
                          onPress={() => {
                            setCategory(cat.name);
                            setShowCategoryModal(false);
                          }}
                        >
                          <Ionicons name={cat.icon} size={24} color={colors.text} />
                          <Text style={[styles.categoryItemText, { color: colors.text }]}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Project Type (e.g., Web, Mobile, Desktop)"
                placeholderTextColor={colors.secondaryText}
                value={projectType}
                onChangeText={setProjectType}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Technologies Used (comma separated)"
                placeholderTextColor={colors.secondaryText}
                value={technologies}
                onChangeText={setTechnologies}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Tech Stack (comma separated)"
                placeholderTextColor={colors.secondaryText}
                value={techStack}
                onChangeText={setTechStack}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Programming Languages (comma separated)"
                placeholderTextColor={colors.secondaryText}
                value={languages}
                onChangeText={setLanguages}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Group Members (comma separated)"
                placeholderTextColor={colors.secondaryText}
                value={groupMembers}
                onChangeText={setGroupMembers}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Project Duration (e.g., 3 months)"
                placeholderTextColor={colors.secondaryText}
                value={projectDuration}
                onChangeText={setProjectDuration}
              />

              <TextInput
                style={[styles.input, styles.textArea, { 
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  color: colors.text
                }]}
                placeholder="Project Details"
                placeholderTextColor={colors.secondaryText}
                value={projectDetails}
                onChangeText={setProjectDetails}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.documentSection}>
                {!document ? (
                  <TouchableOpacity
                    style={[styles.uploadButton, { 
                      backgroundColor: colors.background,
                      borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                    }]}
                    onPress={pickDocument}
                    disabled={isUploading}
                  >
                    <View style={styles.uploadButtonContent}>
                      <Ionicons name="cloud-upload" size={40} color={colors.primary} />
                      <Text style={[styles.uploadButtonText, { color: colors.text }]}>
                        Upload Project Document
                      </Text>
                      <Text style={[styles.uploadSubtext, { color: colors.secondaryText }]}>
                        Tap to select a document
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.documentPreviewCard, { 
                    backgroundColor: colors.background,
                    borderColor: isDarkMode ? '#2A3A2A' : '#e0e0e0',
                  }]}>
                    <TouchableOpacity 
                      style={styles.documentPreview}
                      onPress={() => setShowDocumentModal(true)}
                    >
                      <View style={styles.documentIconContainer}>
                        <Ionicons 
                          name={getDocumentIcon(documentType, documentMimeType)} 
                          size={40} 
                          color={colors.primary} 
                        />
                      </View>
                      <View style={styles.documentInfo}>
                        <Text style={[styles.documentTitle, { color: colors.text }]} numberOfLines={1}>
                          {documentName}
                        </Text>
                        <Text style={[styles.documentMeta, { color: colors.secondaryText }]}>
                          Type: {documentType} | Size: {documentSize}
                        </Text>
                        <View style={styles.documentActions}>
                          <TouchableOpacity 
                            style={[styles.viewButton, { backgroundColor: colors.primary }]}
                            onPress={viewDocument}
                          >
                            <Ionicons name="eye" size={16} color="#fff" />
                            <Text style={styles.viewButtonText}>View</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.removeButton, { backgroundColor: colors.error }]}
                            onPress={() => {
                              setDocument(null);
                              setDocumentName('');
                              setDocumentSize('');
                              setDocumentType('');
                              setDocumentMimeType('');
                            }}
                          >
                            <Ionicons name="trash" size={16} color="#fff" />
                            <Text style={styles.removeButtonText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {isUploading && renderUploadProgress()}

                <Modal
                  visible={showDocumentModal}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowDocumentModal(false)}
                >
                  <BlurView 
                    style={styles.modalContainer}
                    intensity={Platform.OS === 'ios' ? 60 : 100}
                    tint={isDarkMode ? "dark" : "light"}
                  >
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                      <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Document Preview</Text>
                        <TouchableOpacity 
                          style={styles.closeButton}
                          onPress={() => setShowDocumentModal(false)}
                        >
                          <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                      </View>

                      <ScrollView style={styles.modalBody}>
                        <View style={styles.documentDetailSection}>
                          <View style={styles.documentIconLarge}>
                            <Ionicons 
                              name={getDocumentIcon(documentType, documentMimeType)} 
                              size={60} 
                              color={colors.primary} 
                            />
                          </View>
                          
                          <View style={styles.documentDetails}>
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Name:</Text>
                              <Text style={[styles.detailValue, { color: colors.text }]}>{documentName}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Type:</Text>
                              <Text style={[styles.detailValue, { color: colors.text }]}>
                                {documentType} ({documentMimeType || 'Unknown type'})
                              </Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Size:</Text>
                              <Text style={[styles.detailValue, { color: colors.text }]}>{documentSize}</Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.previewSection}>
                          <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
                          {renderDocumentPreview()}
                        </View>

                        <View style={styles.modalActions}>
                          <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.primary }]}
                            onPress={viewDocument}
                          >
                            <Ionicons name="eye" size={20} color="#fff" />
                            <Text style={styles.modalButtonText}>Open Full Document</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    </View>
                  </BlurView>
                </Modal>
              </View>

              <Animated.View style={[
                styles.submitButtonContainer,
                {
                  transform: [{ scale: pulseAnim }],
                }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { 
                      backgroundColor: colors.primary,
                      opacity: (isUploading || isSubmitting) ? 0.7 : 1
                    }
                  ]}
                  onPress={handlePost}
                  disabled={isUploading || isSubmitting}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.submitButtonContent}>
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" size="small" style={styles.submitSpinner} />
                      ) : (
                        <Ionicons name="rocket" size={24} color="#fff" style={styles.submitIcon} />
                      )}
                      <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Creating Project...' : 'Create Project'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  submitButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginLeft: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  submitIcon: {
    marginRight: 8,
  },
  submitSpinner: {
    marginRight: 12,
  },
  postButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 14,
    shadowColor: '#27ae60',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  documentSection: {
    marginBottom: 16,
  },
  documentDetails: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    marginBottom: 8,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  removeDocument: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalBody: {
    padding: 20,
  },
  documentDetailRow: {
    marginBottom: 16,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  modalViewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  previewContainer: {
    marginTop: 20,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  previewWebView: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  modalActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  uploadProgressContent: {
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  uploadProgressText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  uploadButtonContent: {
    alignItems: 'center',
    padding: 20,
  },
  uploadSubtext: {
    marginTop: 4,
    fontSize: 12,
  },
  documentPreviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  documentIconLarge: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 50,
    marginBottom: 20,
  },
  documentDetailSection: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  documentActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    padding: 8,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  previewSection: {
    marginTop: 16,
    width: '100%',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
}); 