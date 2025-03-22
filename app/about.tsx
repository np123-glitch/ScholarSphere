import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ArrowLeft, Github, Linkedin, Mail, Sparkles, Brain, Rocket } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <ThemedView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <ThemedText type="title" style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          About Me & ScholarSphere
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vision Section */}
        <View style={[styles.visionSection, isDarkMode && styles.visionSectionDark]}>
          <View style={[styles.iconContainer, isDarkMode && styles.iconContainerDark]}>
            <Sparkles size={32} color="#6366F1" />
          </View>
          <ThemedText type="title" style={[styles.visionTitle, isDarkMode && styles.visionTitleDark]}>
            My Vision
          </ThemedText>
          <ThemedText type="body" style={[styles.visionText, isDarkMode && styles.visionTextDark]}>
            I envision transforming education with AI-powered learning experiences that adapt to your unique needs.
          </ThemedText>
        </View>

        {/* Creator Section */}
        <View style={[styles.creatorSection, isDarkMode && styles.creatorSectionDark]}>
          <View style={styles.sectionHeader}>
            <Brain size={24} color="#6366F1" />
            <ThemedText type="subtitle" style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              Meet Me
            </ThemedText>
          </View>
          <ThemedText type="title" style={[styles.creatorName, isDarkMode && styles.creatorNameDark]}>
            Neel Prasad
          </ThemedText>
          <ThemedText type="subtitle" style={[styles.creatorTitle, isDarkMode && styles.creatorTitleDark]}>
            Founder & Lead Developer
          </ThemedText>
          <ThemedText type="body" style={[styles.bioText, isDarkMode && styles.bioTextDark]}>
            Hi! I'm Neel. I'm a 16-year-old developer with a passion for revolutionizing education through technology. I understand the challenges of modern learning because I've experienced them firsthand, and that's why I created ScholarSphere—to build innovative AI solutions that truly make a difference.
          </ThemedText>
        </View>

        {/* Mission Section */}
        <View style={[styles.missionSection, isDarkMode && styles.missionSectionDark]}>
          <View style={styles.sectionHeader}>
            <Rocket size={24} color="#6366F1" />
            <ThemedText type="subtitle" style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              My Mission
            </ThemedText>
          </View>
          <ThemedText type="body" style={[styles.missionText, isDarkMode && styles.missionTextDark]}>
            My mission with ScholarSphere is to merge cutting-edge AI with proven educational methods to create a more efficient and engaging learning experience. I am dedicated to making quality education accessible to everyone through innovative technology.
          </ThemedText>
        </View>

        {/* Connect Section */}
        <View style={styles.connectSection}>
          <ThemedText type="subtitle" style={[styles.connectTitle, isDarkMode && styles.connectTitleDark]}>
            Connect with Me
          </ThemedText>
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[styles.socialButton, isDarkMode && styles.socialButtonDark]}
              onPress={() => Linking.openURL('https://github.com/np123-glitch')}
            >
              <Github size={24} color={isDarkMode ? "#fff" : "#000"} />
              <ThemedText type="body" style={[styles.socialButtonText, isDarkMode && styles.socialButtonTextDark]}>
                GitHub
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, isDarkMode && styles.socialButtonDark]}
              onPress={() => Linking.openURL('https://www.linkedin.com/in/neel-prasad-617326280/')}
            >
              <Linkedin size={24} color={isDarkMode ? "#fff" : "#000"} />
              <ThemedText type="body" style={[styles.socialButtonText, isDarkMode && styles.socialButtonTextDark]}>
                LinkedIn
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, isDarkMode && styles.socialButtonDark]}
              onPress={() => Linking.openURL('mailto:neelprasad2008@gmail.com')}
            >
              <Mail size={24} color={isDarkMode ? "#fff" : "#000"} />
              <ThemedText type="body" style={[styles.socialButtonText, isDarkMode && styles.socialButtonTextDark]}>
                Email
              </ThemedText>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
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
    color: '#000',
  },
  headerTitleDark: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  visionSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerDark: {
    backgroundColor: '#1E293B',
  },
  visionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
  },
  visionTitleDark: {
    color: '#fff',
  },
  visionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
    color: '#000',
  },
  visionTextDark: {
    color: '#d1d5db',
  },
  creatorSection: {
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  creatorSectionDark: {
    backgroundColor: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  creatorName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#000',
  },
  creatorNameDark: {
    color: '#fff',
  },
  creatorTitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 16,
    color: '#000',
  },
  creatorTitleDark: {
    color: '#d1d5db',
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  bioTextDark: {
    color: '#d1d5db',
  },
  missionSection: {
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  missionSectionDark: {
    backgroundColor: '#1F2937',
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  missionTextDark: {
    color: '#d1d5db',
  },
  connectSection: {
    marginBottom: 32,
  },
  connectTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  connectTitleDark: {
    color: '#fff',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  socialButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    minWidth: 100,
  },
  socialButtonDark: {
    backgroundColor: '#374151',
  },
  socialButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#000',
  },
  socialButtonTextDark: {
    color: '#fff',
  },
});
