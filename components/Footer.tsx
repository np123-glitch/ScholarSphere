// Footer.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

export function Footer() {
  return (
    <View style={styles.footer}>
      <ThemedText style={styles.footerText}>
        AI can make mistakes, check important information.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 120,
    textAlign: 'center',
  },
});
