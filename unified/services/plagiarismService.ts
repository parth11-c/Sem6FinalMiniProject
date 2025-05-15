import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = 'http://localhost:8082/api';

interface PlagiarismResult {
  score: number;
  originalContent: number;
}

export class PlagiarismService {
  public static async checkPlagiarism(fileUri: string): Promise<PlagiarismResult> {
    try {
      console.log('Starting plagiarism check...');
      
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'application/octet-stream',
        name: 'document.txt'
      } as any);

      // Make API request
      const response = await fetch(`${API_BASE_URL}/plagiarism/check`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check plagiarism: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        score: result.score,
        originalContent: result.originalContent
      };
    } catch (error) {
      console.error('Plagiarism check error:', error);
      throw error;
    }
  }
} 