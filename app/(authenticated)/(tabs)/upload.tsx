import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  View,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Config from '@/components/Config';
import { decodeJwt } from '@/utils/decodeJwt';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UploadResponse {
  message: string;
}

interface FileRecord {
  fileName: string;
  url: string;
}

type FileType = 'pdf';

export default function DocumentUploader() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const isDarkMode = systemColorScheme === 'dark';
  const { token } = useAuthSession();
  const [userName, setUserName] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [userFiles, setUserFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = Config.API_BASE_URL;

  // Logout function for expired token
  const logoutUser = async () => {
    await AsyncStorage.removeItem('@user_token');
    router.replace('/login');
  };

  // Function to handle API responses
  const handleApiResponse = async (response: Response) => {
    const data = await response.json();
    
    if (!response.ok) {
      if (data.message === 'Token has expired!') {
        Alert.alert('Session Expired', 'Your session has expired. Please log out and log in again.', [
          { text: 'OK', onPress: logoutUser },
        ]);
        return null;
      }
      Alert.alert('Error', data.message || 'Something went wrong.');
      return null;
    }
    
    return data;
  };

  // Fetch user files
  const fetchUserFiles = async () => {
    if (!userName) return;

    try {
      const response = await fetch(`${apiUrl}/files/${userName}`, {
        headers: {
          Authorization: `Bearer ${token.current}`,
        },
      });

      const data = await handleApiResponse(response);
      if (data) {
        setUserFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      Alert.alert('Error', 'Could not fetch files. Please try again.');
    }
  };

  // Decode token and fetch files on mount
  useEffect(() => {
    if (token.current) {
      const decodedToken = decodeJwt(token.current);
      if (decodedToken?.sub) {
        setUserName(decodedToken.sub);
      } else {
        Alert.alert('Error', 'User name not found in token.');
        setUserName(null);
      }
    } else {
      setUserName(null);
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    if (userName) {
      fetchUserFiles();
    }
  }, [userName]);

  // Upload Document
  const pickAndUploadDocument = async (fileType: FileType) => {
    try {
      const mimeTypes = ['application/pdf'];
      const docRes = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (docRes.canceled || !docRes.assets?.length) {
        Alert.alert('Canceled', 'No file was selected.');
        return;
      }

      const asset = docRes.assets[0];
      const fileUri = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
      if (!fileUri) {
        Alert.alert('Error', 'Invalid file URI.');
        return;
      }

      const file = {
        uri: asset.uri,
        name: asset.name || 'uploaded_file.pdf',
        type: 'application/pdf',
      };

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      setUploadingPdf(true);

      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.current}`,
        },
        body: formData,
      });

      const data = await handleApiResponse(response);
      if (data) {
        Alert.alert('Success', data.message);
        fetchUserFiles();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'An error occurred while uploading the file.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Open file URL
  const handleOpenFile = async (fileUrl: string) => {
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert('Error', "Can't open this file URL");
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open file.');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>Upload Document</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.uploadContainer}>
        <TouchableOpacity style={[styles.uploadButton, styles.pdfButton]} onPress={() => pickAndUploadDocument('pdf')} disabled={uploadingPdf}>
          {uploadingPdf ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />}
        </TouchableOpacity>
        <ThemedText type="body" style={styles.uploadText}>{uploadingPdf ? 'Uploading...' : 'Pick a PDF to Upload'}</ThemedText>
      </View>

      <View style={{ height: 40 }} />

      <View style={styles.fileListContainer}>
        <ThemedText type="title" style={styles.fileListTitle}>Your Uploaded Files</ThemedText>
        <FlatList
          data={userFiles}
          keyExtractor={(item) => item.fileName}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.fileItem} onPress={() => handleOpenFile(item.url)}>
              <MaterialIcons name="attachment" size={24} color={isDarkMode ? '#ddd' : '#333'} style={{ marginRight: 10 }} />
              <ThemedText type="body">{item.fileName}</ThemedText>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<ThemedText type="body">No files uploaded yet.</ThemedText>}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  containerDark: { backgroundColor: '#111' },
  containerLight: { backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  uploadButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  pdfButton: { backgroundColor: '#FF5722' },
  fileListContainer: { flex: 1 },
});
