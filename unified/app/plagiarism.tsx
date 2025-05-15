import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Linking, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { useTheme, themeColors } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { PlagiarismService } from '../services/plagiarismService';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface PlagiarismResult {
  score: number;
  originalContent: number;
}

export default function PlagiarismScreen() {
  const { theme, isDarkMode } = useTheme();
  const colors = themeColors[theme];
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  const pickDocument = async () => {
    try {
      console.log('Starting document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', JSON.stringify(result, null, 2));

      // Check if the result has assets (new format) or direct properties (old format)
      const selectedAsset = result.assets?.[0] || result;
      
      if (!result.canceled && (selectedAsset.uri || result.uri)) {
        // Verify file exists before setting it
        const fileUri = selectedAsset.uri || result.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log('File info after selection:', JSON.stringify(fileInfo, null, 2));

        if (!fileInfo.exists) {
          throw new Error('Selected file does not exist in the cache directory');
        }

        // Try to read a small portion of the file to verify access
        try {
          const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
            length: 100, // Read just the first 100 bytes to verify access
            position: 0,
          });
          console.log('Successfully verified file access, first 100 bytes read');
        } catch (readError) {
          console.error('Error reading file:', readError);
          throw new Error('Could not read the selected file. Please try another file.');
        }

        // Create a normalized file object
        const normalizedFile = {
          type: 'success' as const,
          name: selectedAsset.name || result.name,
          uri: fileUri,
          size: selectedAsset.size || result.size,
          mimeType: selectedAsset.mimeType || result.mimeType,
        };

        setSelectedFile(normalizedFile);
        setResult(null); // Reset previous results
        console.log('Document successfully selected and verified:', {
          name: normalizedFile.name,
          uri: normalizedFile.uri,
          size: normalizedFile.size,
          mimeType: normalizedFile.mimeType,
          exists: fileInfo.exists,
          size: fileInfo.size
        });
      } else {
        console.log('Document selection cancelled or failed:', result.canceled ? 'canceled' : 'no file selected');
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

  const handleCheckPlagiarism = async () => {
    if (!selectedFile || selectedFile.type !== 'success') {
      Alert.alert('Error', 'Please select a document first');
      return;
    }

    console.log('Starting plagiarism check for file:', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      size: selectedFile.size,
      mimeType: selectedFile.mimeType
    });
    
    setIsUploading(true);

    try {
      // Verify file exists and is readable
      const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
      console.log('File info before upload:', JSON.stringify(fileInfo, null, 2));

      if (!fileInfo.exists) {
        throw new Error('Selected file does not exist in the cache directory');
      }

      if (!fileInfo.size || fileInfo.size === 0) {
        throw new Error('Selected file is empty');
      }

      // Read file content to verify it's accessible
      console.log('Attempting to read file content...');
      const fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('File content read successfully, length:', fileContent.length);

      if (!fileContent || fileContent.length === 0) {
        throw new Error('Could not read file content');
      }

      console.log('Calling plagiarism service...');
      const plagiarismResult = await PlagiarismService.checkPlagiarism(selectedFile.uri);
      console.log('Plagiarism check completed successfully');
      
      setResult(plagiarismResult);
    } catch (error) {
      console.error('Plagiarism check error:', error);
      let errorMessage = 'Failed to check plagiarism. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to authenticate')) {
          errorMessage += 'Authentication failed. Please check your API credentials.';
        } else if (error.message.includes('Failed to upload')) {
          errorMessage += 'Failed to upload document. Please try again.';
        } else if (error.message.includes('Timeout')) {
          errorMessage += 'Request timed out. Please try again.';
        } else if (error.message.includes('does not exist')) {
          errorMessage += 'The selected file could not be found. Please try selecting the file again.';
        } else if (error.message.includes('empty')) {
          errorMessage += 'The selected file is empty. Please select a different file.';
        } else {
          errorMessage += error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSourcePress = (url: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open the source URL');
    });
  };

  const renderResults = () => {
    if (!result) return null;

    return (
      <View style={[styles.resultsContainer, { backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}>
        <Text style={[styles.resultsTitle, { color: colors.text }]}>Plagiarism Check Results</Text>
        
        {/* Score Summary */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Plagiarism Score</Text>
            <Text style={[styles.scoreValue, { color: result.score > 20 ? '#FF4444' : '#4CAF50' }]}>
              {result.score}%
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Original Content</Text>
            <Text style={[styles.scoreValue, { color: '#4CAF50' }]}>
              {result.originalContent}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={[colors.gradient[0], colors.gradient[1]] as [string, string]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>Plagiarism Check</Text>
            </View>

            <View style={[styles.uploadContainer, { backgroundColor: isDarkMode ? 'rgba(42, 58, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}>
              <Ionicons 
                name="document-text-outline" 
                size={64} 
                color={isDarkMode ? '#4CAF50' : '#2E7D32'} 
                style={styles.uploadIcon}
              />
              <Text style={[styles.uploadTitle, { color: colors.text }]}>
                Upload Your Document
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.secondaryText }]}>
                Supported formats: PDF, DOC, DOCX
              </Text>

              <TouchableOpacity
                style={[styles.uploadButton, { 
                  backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32',
                  opacity: selectedFile?.type === 'success' ? 0.7 : 1
                }]}
                onPress={pickDocument}
                disabled={isUploading}
              >
                <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>
                  {selectedFile?.type === 'success' ? 'Change Document' : 'Select Document'}
                </Text>
              </TouchableOpacity>

              {selectedFile?.type === 'success' && (
                <View style={styles.fileInfo}>
                  <Ionicons name="document" size={20} color={colors.text} />
                  <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.checkButton,
                  { 
                    backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32',
                    opacity: selectedFile?.type === 'success' ? 1 : 0.5
                  }
                ]}
                onPress={handleCheckPlagiarism}
                disabled={selectedFile?.type !== 'success' || isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                    <Text style={styles.checkButtonText}>Check Plagiarism</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {renderResults()}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 0 : 40, // Add padding for Android devices
  },
  content: {
    flex: 1,
    padding: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  uploadContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  resultsContainer: {
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
}); 