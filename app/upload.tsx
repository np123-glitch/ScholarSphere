// components/DocumentUploader.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Config from '@/components/Config';

interface UploadResponse {
  message: string;
  // Add other fields based on your API response
}

export default function DocumentUploader() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const isDarkMode = systemColorScheme === 'dark';
  const { token } = useAuthSession();

  const [uploading, setUploading] = useState(false);

  const apiUrl = Config.API_BASE_URL;

  const pickAndUploadDocument = async () => {
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Restrict to PDFs only
        copyToCacheDirectory: true, // Ensure file is cached properly
        multiple: false, // Allow only single file selection
      });

      // Log the entire response for debugging
      console.log('Document selected:', docRes);

      // Check if the user canceled the picker
      if (docRes.canceled) {
        console.log('User canceled the document picker');
        Alert.alert('Canceled', 'No file was selected.');
        return;
      }

      // Ensure 'assets' array exists and has at least one asset
      if (!docRes.assets || docRes.assets.length === 0) {
        console.error('No assets found in the selected document:', docRes);
        Alert.alert('Error', 'No file information found.');
        return;
      }

      // Extract the first asset
      const asset = docRes.assets[0];

      // Ensure 'uri' exists within the asset
      if (!asset.uri) {
        console.error('No URI found in the asset:', asset);
        Alert.alert('Error', 'Could not retrieve the file URI.');
        return;
      }

      // Prepare file for upload
      const fileUri =
        Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;

      // Additional check to ensure 'fileUri' is valid
      if (!fileUri) {
        console.error('Invalid file URI after processing:', fileUri);
        Alert.alert('Error', 'Invalid file URI.');
        return;
      }

      const file = {
        uri: asset.uri, // Use the original URI for FormData
        name: asset.name || 'uploaded_file.pdf', // Provide a default name if undefined
        type: asset.mimeType || 'application/pdf', // Fallback to PDF if mimeType is missing
      };

      const formData = new FormData();

      // Append the file to FormData with the key 'file'
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });

      setUploading(true);

      // Upload the file using Axios
      const response = await axios.post<UploadResponse>(
        `${apiUrl}/upload`,
        formData,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token.current}`, // Include JWT
            // Do NOT set 'Content-Type' manually; let Axios handle it
          },
        }
      );

      console.log('Upload Successful:', response.data);
      
      // Use the server's message in the alert
      Alert.alert('Success', response.data.message);
    } catch (error: any) {
      console.error('Error while selecting or uploading file:', error);
      
      // Check if the error response exists and has data
      if (error.response && error.response.data && error.response.data.error) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert(
          'Error',
          'An error occurred while uploading the file.'
        );
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* Header with Back Icon and Title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.back()}
          accessibilityLabel="Go Back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>

        <ThemedText
          type="title"
          style={[styles.headerTitle, isDarkMode ? { color: '#fff' } : {}]}
        >
          Upload Document
        </ThemedText>

        <View style={styles.placeholder} />
      </View>

      {/* Upload Button */}
      <View style={styles.uploadContainer}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickAndUploadDocument}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="upload-file" size={24} color="#fff" />
          )}
        </TouchableOpacity>
        <ThemedText
          type="body"
          style={[styles.uploadText, isDarkMode ? { color: '#fff' } : {}]}
        >
          {uploading ? 'Uploading...' : 'Pick a PDF to Upload'}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch', // Consistent with TodoList
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#111111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  backIcon: {
    padding: 5,
  },
  placeholder: {
    width: 24, // To balance the header layout
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    width: 60,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
