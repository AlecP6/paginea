import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { friendshipApi, userApi } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await friendshipApi.getFriends();
      setFriends(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement des amis');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await friendshipApi.getFriendRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await userApi.searchUsers(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la recherche');
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendshipApi.sendRequest(userId);
      Alert.alert('Succès', 'Demande envoyée !');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de l\'envoi');
    }
  };

  const handleRespondToRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      await friendshipApi.respondToRequest(friendshipId, action);
      Alert.alert('Succès', action === 'accept' ? 'Ami ajouté !' : 'Demande refusée');
      fetchFriends();
      fetchRequests();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la réponse');
    }
  };

  const renderFriend = ({ item }: { item: any }) => (
    <View style={styles.friendItem}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.username}
        </Text>
      </View>
    </View>
  );

  const renderRequest = ({ item }: { item: any }) => (
    <View style={styles.requestItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.initiator.username[0].toUpperCase()}</Text>
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.friendName}>{item.initiator.username}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => handleRespondToRequest(item.id, 'accept')}
        >
          <Ionicons name="checkmark" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.requestButton, styles.rejectButton]}
          onPress={() => handleRespondToRequest(item.id, 'reject')}
        >
          <Ionicons name="close" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResult = ({ item }: { item: any }) => (
    <View style={styles.searchResultItem}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar.startsWith('http') ? item.avatar : `http://10.0.2.2:3001${item.avatar}` }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.searchResultInfo}>
        <Text style={styles.friendName}>
          {item.username}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleSendRequest(item.id)}
      >
        <Ionicons name="person-add" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Amis</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher des utilisateurs..."
            onSubmitEditing={handleSearch}
          />
        </View>
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.searchResults}
          />
        )}
      </View>

      {requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demandes d'amis ({requests.length})</Text>
          <FlatList
            data={requests}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes amis ({friends.length})</Text>
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={fetchFriends}
        />
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchResults: {
    marginTop: 12,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendInfo: {
    marginLeft: 12,
    flex: 1,
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  friendUsername: {
    fontSize: 14,
    color: '#64748b',
  },
  requestActions: {
    flexDirection: 'row',
  },
  requestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
});

