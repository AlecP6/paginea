import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      const response = await userApi.updateProfile(formData);
      updateUser(response.data);
      setEditing(false);
      Alert.alert('Succès', 'Profil mis à jour !');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handlePickImage = async () => {
    // Demander la permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'Permission d\'accès à la galerie nécessaire');
      return;
    }

    // Ouvrir la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      setUploadingAvatar(true);
      try {
        const fileName = asset.uri.split('/').pop() || 'avatar.jpg';
        const mimeType = asset.mimeType || 'image/jpeg';
        
        const response = await userApi.uploadAvatar(asset.uri, fileName, mimeType);
        updateUser(response.data);
        Alert.alert('Succès', 'Photo de profil mise à jour !');
      } catch (error: any) {
        Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de l\'upload');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Ionicons
            name={editing ? 'close' : 'create-outline'}
            size={24}
            color="#1e293b"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!editing ? (
          <>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar.startsWith('http') ? user.avatar : `http://10.0.2.2:3001${user.avatar}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLargeText}>{user.username[0].toUpperCase()}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handlePickImage}
                disabled={uploadingAvatar}
              >
                <Ionicons name="camera" size={20} color="#ffffff" />
              </TouchableOpacity>
              {uploadingAvatar && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>Upload...</Text>
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.userName}>
                {user.username}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>

              {user.bio && (
                <View style={styles.bioContainer}>
                  <Text style={styles.bioLabel}>Bio</Text>
                  <Text style={styles.bioText}>{user.bio}</Text>
                </View>
              )}

              <Text style={styles.memberSince}>
                Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                numberOfLines={4}
                placeholder="Parlez-nous de vous et de vos goûts littéraires..."
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#0ea5e9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: '12.5%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  userUsername: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  bioContainer: {
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  memberSince: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

