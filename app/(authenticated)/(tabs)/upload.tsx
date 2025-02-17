import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  View,
  ActivityIndicator,
  FlatList, // <-- For listing files
  Linking,  // <-- To open file URLs
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Config from '@/components/Config';
import { decodeJwt, JwtPayload } from '@/utils/decodeJwt';

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

  const fetchUserFiles = async () => {
    if (!userName) {
      console.warn('Cannot fetch files: userName is null');
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/files/${userName}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.current}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        if (response.message === 'Token has expired!') {
                          Alert.alert('Session Expired', 'Your session has expired. Please log out and log in again.');
                        } else {
                          Alert.alert('Error', response.message);
                        }
      }
  
      const data: FileRecord[] = await response.json();
      setUserFiles(data);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      Alert.alert(
        'Error',
        err.message || 'Could not fetch files. Please try again.'
      );
    }
  };

  useEffect(() => {
    if (token.current) {
      const decodedToken = decodeJwt(token.current);
      console.log('Decoded Token:', decodedToken); // Debugging line
      if (decodedToken && decodedToken.sub) {
        setUserName(decodedToken.sub); // Use 'sub' exclusively
      } else {
        console.error('Name not found in token:', decodedToken);
        Alert.alert('Error', 'User name not found in token.');
        setUserName(null);
      }
      setIsLoading(false);
    } else {
      setUserName(null);
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (userName) {
      fetchUserFiles();
    }
  }, [userName]); // Trigger fetch when userName is set

  const pickAndUploadDocument = async (fileType: FileType) => {
    try {
      const mimeTypes = ['application/pdf'];

      const docRes = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (docRes.canceled) {
        Alert.alert('Canceled', 'No file was selected.');
        return;
      }

      if (!docRes.assets || docRes.assets.length === 0) {
        Alert.alert('Error', 'No file information found.');
        return;
      }

      const asset = docRes.assets[0];
      if (!asset.uri) {
        Alert.alert('Error', 'Could not retrieve the file URI.');
        return;
      }

      const fileUri =
        Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
      if (!fileUri) {
        Alert.alert('Error', 'Invalid file URI.');
        return;
      }

      const file = {
        uri: asset.uri,
        name:
          asset.name ||
          (fileType === 'pdf' ? 'uploaded_file.pdf' : 'uploaded_recording.m4a'),
        type:
          asset.mimeType ||
          (fileType === 'pdf' ? 'application/pdf' : 'audio/m4a'),
      };

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      // Uploading state
      setUploadingPdf(true);

      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.current}`,
          // Do not set 'Content-Type' when using FormData; it will be set automatically.
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred while uploading the file.');
      }

      const data: UploadResponse = await response.json();

      Alert.alert('Success', data.message);

      fetchUserFiles();
    } catch (error: any) {
      console.error('Error while selecting or uploading file:', error);
      Alert.alert('Error', error.message || 'An error occurred while uploading the file.');
    } finally {
      setUploadingPdf(false);
    }
  };

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
      <ThemedView
        style={[
          styles.container,
          isDarkMode ? styles.containerDark : styles.containerLight,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
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

      <View style={styles.uploadContainer}>
        <TouchableOpacity
          style={[styles.uploadButton, styles.pdfButton]}
          onPress={() => pickAndUploadDocument('pdf')}
          disabled={uploadingPdf}
        >
          {uploadingPdf ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />
          )}
        </TouchableOpacity>
        <ThemedText
          type="body"
          style={[styles.uploadText, isDarkMode ? { color: '#fff' } : {}]}
        >
          {uploadingPdf ? 'Uploading...' : 'Pick a PDF to Upload'}
        </ThemedText>
      </View>

      <View style={{ height: 40 }} />

      <View style={styles.fileListContainer}>
        <ThemedText
          type="title"
          style={[
            { fontSize: 20, marginBottom: 10 },
            isDarkMode ? { color: '#fff' } : {},
          ]}
        >
          Your Uploaded Files
        </ThemedText>

        <FlatList
          data={userFiles}
          keyExtractor={(item) => item.fileName}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fileItem}
              onPress={() => handleOpenFile(item.url)}
            >
              <MaterialIcons
                name="attachment"
                size={24}
                color={isDarkMode ? '#ddd' : '#333'}
                style={{ marginRight: 10 }}
              />
              <ThemedText
                type="body"
                style={isDarkMode ? { color: '#fff' } : {}}
              >
                {item.fileName}
              </ThemedText>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <ThemedText type="body" style={isDarkMode ? { color: '#aaa' } : {}}>
              No files uploaded yet.
            </ThemedText>
          }
        />
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
    alignItems: 'stretch',
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
    width: 24,
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  pdfButton: {
    backgroundColor: '#FF5722', // Orange for PDF
  },
  uploadText: {
    fontSize: 18,
    textAlign: 'center',
  },
  fileListContainer: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});
