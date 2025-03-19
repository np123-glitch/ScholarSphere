import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ArrowLeft, FolderPlus } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';

const courses = [
  { 
    id: 'apbio',
    title: 'AP Biology',
    icon: 'biotech',
    color: '#22C55E',
    description: 'Comprehensive study materials for AP Biology'
  },
  { 
    id: 'apstat',
    title: 'AP Statistics',
    icon: 'bar-chart',
    color: '#6366F1',
    description: 'Statistical concepts and practice problems'
  },
  { 
    id: 'aphuman',
    title: 'AP Human Geography',
    icon: 'public',
    color: '#F59E0B',
    description: 'Global patterns and cultural geography'
  },
  { 
    id: 'apphysics',
    title: 'AP Physics',
    icon: 'science',
    color: '#EC4899',
    description: 'Physics principles and problem sets'
  },
];

export default function UploadScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const numColumns = 2;
  const tileSize = Dimensions.get('window').width / numColumns - 24;

  const handleCourseSelect = (courseId: string) => {
    router.push({
      pathname: '/course/[id]',
      params: { id: courseId }
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Study Materials
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ready-to-Use Materials Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Ready-to-Use Content
          </ThemedText>

          <View style={styles.grid}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.courseTile,
                  { width: tileSize },
                  isDark ? styles.courseTileDark : styles.courseTileLight,
                ]}
                onPress={() => handleCourseSelect(course.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: course.color }]}>
                  <MaterialIcons name={course.icon} size={32} color="#fff" />
                </View>
                <ThemedText type="subtitle" style={styles.courseTitle}>
                  {course.title}
                </ThemedText>
                <ThemedText type="body" style={styles.courseDescription}>
                  {course.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        

        {/* Your Content Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Content
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.yourContentTile,
              isDark ? styles.courseTileDark : styles.courseTileLight,
            ]}
            onPress={() => handleCourseSelect('personal')}
          >
            <View style={styles.yourContentHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#0EA5E9', marginBottom: 0 }]}>
                <FolderPlus size={32} color="#fff" />
              </View>
              <View style={styles.yourContentTextContainer}>
                <ThemedText type="subtitle" style={[styles.courseTitle, styles.yourContentTitle]}>
                  Personal Study Materials
                </ThemedText>
                <ThemedText type="body" style={styles.courseDescription}>
                  Upload and manage your own study materials and notes
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  courseTile: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  courseTileLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseTileDark: {
    backgroundColor: '#1F2937',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  yourContentTile: {
    borderRadius: 16,
    padding: 16,
  },
  yourContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yourContentTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  yourContentTitle: {
    marginBottom: 4,
  },
});