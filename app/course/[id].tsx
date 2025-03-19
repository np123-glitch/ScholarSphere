import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ArrowLeft, Eye, Plus } from 'lucide-react-native';
import { useAuthSession } from '@/components/AuthProvider';
import Config from '@/components/Config';
import { decodeJwt } from '@/utils/decodeJwt';

interface FileMetadata {
  fileName: string; // from /files/<username> we get { fileName, url }
  url: string;
  type?: string;
  size?: string;
  lastModified?: string;
}

export default function CourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isDark = useColorScheme() === 'dark';
  const { signOut, token } = useAuthSession();

  // State for loading indicator, file list, course title, upload in progress, and userName
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // 1) Map route ID to a friendly course title
  useEffect(() => {
    const courseMap: { [key: string]: string } = {
      personal: 'Your Content',
      apbio: 'AP Biology',
      apstat: 'AP Statistics',
      aphuman: 'AP Human Geography',
      apphysics: 'AP Physics',
    };
    setCourseTitle(courseMap[id as string] || 'Course Materials');
  }, [id]);

  // 2) Decode the token at the top level
  useEffect(() => {
    if (token.current) {
      const decodedToken = decodeJwt(token.current);
      if (decodedToken) {
        setUserName(decodedToken.sub || null);
      } else {
        console.warn('decodeJwt returned undefined or invalid token');
      }
    }
  }, [token]);

  // 3) Fetch files once we know the userName (for "personal") or we have an ID for courses
  useEffect(() => {
    // If route is "personal" but userName is not set, wait
    if (id === 'personal' && !userName) return;

    loadCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userName]);

  // 4) The function to actually load data from the server
  const loadCourseData = async () => {
    setLoading(true);
    try {
      let endpoint: string;

      // If "personal", fetch /files/<userName>; else fetch /documents/<id>
      if (id === 'personal' && userName) {
        endpoint = `${Config.API_BASE_URL}/files/${userName}`;
      } else {
        endpoint = `${Config.API_BASE_URL}/documents/${id}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.current}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token has expired!') {
          Alert.alert('Session Expired', 'Please log out and log in again.', [
            { text: 'OK', onPress: () => signOut() },
          ]);
          return;
        }
        throw new Error(errorData.message || 'Failed to fetch files');
      }

      const data: FileMetadata[] = await response.json();
      setFiles(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load course materials');
    } finally {
      setLoading(false);
    }
  };

  // 5) Upload a document
  const pickAndUploadDocument = async () => {
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
        name: asset.name || 'uploaded_file.pdf',
        type: asset.mimeType || 'application/pdf',
      };

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      setUploading(true);

      // Upload to your server
      const uploadEndpoint = `${Config.API_BASE_URL}/upload`;
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.current}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'An error occurred while uploading the file.'
        );
      }

      const data = await response.json();
      Alert.alert('Success', data.message || 'File uploaded successfully!');
      // Refresh the list
      loadCourseData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    pickAndUploadDocument();
  };

  const handleFilePress = (fileUrl: string) => {
    Alert.alert('Opening File', `File URL: ${fileUrl}`);
    Linking.openURL(fileUrl);
  };

  // 6) Render the UI
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <ThemedText type="title" style={styles.headerTitle} numberOfLines={1}>
            {courseTitle}
          </ThemedText>
        </View>

        <View style={styles.headerRight}>
          {id === 'personal' && (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                isDark ? styles.uploadButtonDark : styles.uploadButtonLight,
              ]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Plus size={20} color={isDark ? '#fff' : '#000'} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        </View>
      ) : (
        <>
          {/* Table Header */}
          <View
            style={[
              styles.tableHeader,
              isDark ? styles.tableHeaderDark : styles.tableHeaderLight,
            ]}
          >
            <ThemedText type="body" style={[styles.headerCell, styles.fileNameHeader]}>
              File Name
            </ThemedText>
          </View>

          {/* File List */}
          {files.length === 0 ? (
            <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
              No files found.
            </ThemedText>
          ) : (
            <ScrollView style={styles.tableContent}>
              {files.map((file, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.fileRow, isDark ? styles.fileRowDark : styles.fileRowLight]}
                  onPress={() => handleFilePress(file.url)}
                >
                  <View style={[styles.cell, styles.fileNameCell]}>
                    <Eye size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    <ThemedText type="body" style={styles.fileName} numberOfLines={1}>
                      {file.fileName}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    height: 40,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonLight: {
    backgroundColor: '#F3F4F6',
  },
  uploadButtonDark: {
    backgroundColor: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tableHeaderLight: {
    backgroundColor: '#F3F4F6',
  },
  tableHeaderDark: {
    backgroundColor: '#374151',
  },
  headerCell: {
    fontWeight: '600',
    textAlign: 'left',
  },
  fileNameHeader: {
    flex: 2,
    paddingLeft: 24,
  },
  tableContent: {
    flex: 1,
  },
  fileRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  fileRowLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fileRowDark: {
    backgroundColor: '#1F2937',
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileNameCell: {
    flex: 2,
  },
  fileName: {
    fontWeight: '500',
    marginLeft: 8,
  },
});
