import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="book" size={80} color="#0ea5e9" />
        <Text style={styles.title}>Paginea</Text>
        <Text style={styles.subtitle}>
          Partagez votre passion pour la lecture
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.primaryButtonText}>S'inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.secondaryButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
});

