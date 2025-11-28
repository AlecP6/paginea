import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { bookReviewApi, booksApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function BooksScreen() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'READ' | 'READING' | 'WANT_TO_READ' | 'ABANDONED'>('ALL');
  const [selectedCoverUri, setSelectedCoverUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    bookTitle: '',
    bookAuthor: '',
    rating: 5,
    review: '',
    status: 'READ',
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await bookReviewApi.getReviews();
      setReviews(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement des critiques');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBooks = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await booksApi.searchBooks(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erreur recherche:', error);
      Alert.alert('Erreur', 'Erreur lors de la recherche de livres');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = (book: any) => {
    setSelectedBook(book);
    setFormData({
      ...formData,
      bookTitle: book.title,
      bookAuthor: book.author,
    });
    
    // Définir la couverture si disponible
    if (book.coverImage) {
      setSelectedCoverUri(book.coverImage);
    }
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedBook(null);
    setFormData({
      bookTitle: '',
      bookAuthor: '',
      rating: 5,
      review: '',
      status: 'READ',
    });
    setSelectedCoverUri(null);
  };

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie pour choisir une couverture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3], // Format couverture de livre
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedCoverUri(result.assets[0].uri);
    }
  };

  const handleCreateReview = async () => {
    try {
      const response = await bookReviewApi.createReview(formData);
      const createdReview = response.data;

      // Upload cover image if selected
      if (selectedCoverUri && createdReview.id) {
        const coverFormData = new FormData();
        const fileExtension = selectedCoverUri.split('.').pop();
        const mimeType = `image/${fileExtension}`;

        coverFormData.append('cover', {
          uri: selectedCoverUri,
          name: `cover-${createdReview.id}-${Date.now()}.${fileExtension}`,
          type: mimeType,
        } as any);

        await bookReviewApi.uploadBookCover(createdReview.id, coverFormData);
      }

      setModalVisible(false);
      setFormData({
        bookTitle: '',
        bookAuthor: '',
        rating: 5,
        review: '',
        status: 'READ',
      });
      setSelectedCoverUri(null);
      setSelectedBook(null);
      setSearchQuery('');
      setSearchResults([]);
      fetchReviews();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la publication');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      'Supprimer l\'avis',
      'Êtes-vous sûr de vouloir supprimer cet avis ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookReviewApi.deleteReview(reviewId);
              fetchReviews();
              Alert.alert('Succès', 'Avis supprimé !');
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.review}>
      <View style={styles.reviewHeader}>
        {item.author.avatar ? (
          <Image 
            source={{ uri: item.author.avatar.startsWith('http') ? item.author.avatar : `http://10.0.2.2:3001${item.author.avatar}` }} 
            style={styles.avatarImage} 
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.author.username[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.reviewHeaderInfo}>
          <Text style={styles.authorName}>{item.author.username}</Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        {user && item.author.id === user.id && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReview(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {item.bookCover && (
        <Image
          source={{ uri: item.bookCover.startsWith('http') ? item.bookCover : `http://10.0.2.2:3001${item.bookCover}` }}
          style={styles.bookCoverImage}
        />
      )}

      <Text style={styles.bookTitle}>{item.bookTitle}</Text>
      <Text style={styles.bookAuthor}>par {item.bookAuthor}</Text>

      <View style={styles.ratingContainer}>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? 'star' : 'star-outline'}
              size={20}
              color="#fbbf24"
            />
          ))}
        </View>
        <Text style={styles.ratingText}>{item.rating}/5</Text>
      </View>

      {item.review && <Text style={styles.reviewText}>{item.review}</Text>}

      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={20} color="#ef4444" />
          <Text style={styles.actionText}>{item._count.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
          <Text style={styles.actionText}>{item._count.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Filtrer les reviews selon l'onglet actif
  const filteredReviews = activeTab === 'ALL' 
    ? reviews 
    : reviews.filter(review => review.status === activeTab);

  // Compter les reviews par statut
  const counts = {
    ALL: reviews.length,
    READ: reviews.filter(r => r.status === 'READ').length,
    READING: reviews.filter(r => r.status === 'READING').length,
    WANT_TO_READ: reviews.filter(r => r.status === 'WANT_TO_READ').length,
    ABANDONED: reviews.filter(r => r.status === 'ABANDONED').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Livres</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Onglets de filtrage */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ALL' && styles.tabActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
            Tous ({counts.ALL})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'READ' && styles.tabActiveGreen]}
          onPress={() => setActiveTab('READ')}
        >
          <Text style={[styles.tabText, activeTab === 'READ' && styles.tabTextActive]}>
            📚 Lu ({counts.READ})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'READING' && styles.tabActiveBlue]}
          onPress={() => setActiveTab('READING')}
        >
          <Text style={[styles.tabText, activeTab === 'READING' && styles.tabTextActive]}>
            📖 En cours ({counts.READING})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'WANT_TO_READ' && styles.tabActiveYellow]}
          onPress={() => setActiveTab('WANT_TO_READ')}
        >
          <Text style={[styles.tabText, activeTab === 'WANT_TO_READ' && styles.tabTextActive]}>
            🔖 À lire ({counts.WANT_TO_READ})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ABANDONED' && styles.tabActiveGray]}
          onPress={() => setActiveTab('ABANDONED')}
        >
          <Text style={[styles.tabText, activeTab === 'ABANDONED' && styles.tabTextActive]}>
            ⏸️ Abandonné ({counts.ABANDONED})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredReviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchReviews}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'ALL' && 'Aucun livre pour le moment.'}
              {activeTab === 'READ' && 'Aucun livre lu.'}
              {activeTab === 'READING' && 'Aucun livre en cours.'}
              {activeTab === 'WANT_TO_READ' && 'Aucun livre à lire.'}
              {activeTab === 'ABANDONED' && 'Aucun livre abandonné.'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle critique</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#1e293b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Recherche Google Books */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchLabel}>🔍 Rechercher dans Google Books</Text>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tapez le titre ou l'auteur..."
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    handleSearchBooks(text);
                  }}
                />
              </View>
              
              {isSearching && (
                <View style={styles.searchingContainer}>
                  <ActivityIndicator size="small" color="#0ea5e9" />
                  <Text style={styles.searchingText}>Recherche en cours...</Text>
                </View>
              )}
              
              {searchResults.length > 0 && (
                <ScrollView style={styles.searchResults} nestedScrollEnabled>
                  {searchResults.map((book, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.searchResultItem}
                      onPress={() => handleSelectBook(book)}
                    >
                      {book.coverImage && (
                        <Image
                          source={{ uri: book.coverImage }}
                          style={styles.searchResultImage}
                        />
                      )}
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultTitle} numberOfLines={2}>
                          {book.title}
                        </Text>
                        <Text style={styles.searchResultAuthor} numberOfLines={1}>
                          {book.author}
                        </Text>
                        {book.publishedDate && (
                          <Text style={styles.searchResultDate}>
                            {book.publishedDate}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Livre sélectionné */}
            {selectedBook && (
              <View style={styles.selectedBookContainer}>
                <View style={styles.selectedBookHeader}>
                  <View style={styles.selectedBookInfo}>
                    {selectedBook.coverImage && (
                      <Image
                        source={{ uri: selectedBook.coverImage }}
                        style={styles.selectedBookImage}
                      />
                    )}
                    <View style={styles.selectedBookText}>
                      <Text style={styles.selectedBookLabel}>✅ Livre sélectionné</Text>
                      <Text style={styles.selectedBookTitle} numberOfLines={2}>
                        {selectedBook.title}
                      </Text>
                      <Text style={styles.selectedBookAuthor} numberOfLines={1}>
                        {selectedBook.author}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={handleClearSelection}>
                    <Ionicons name="close-circle" size={28} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Séparateur */}
            {selectedBook && (
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou modifier</Text>
                <View style={styles.separatorLine} />
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Titre du livre"
              value={formData.bookTitle}
              onChangeText={(text) => setFormData({ ...formData, bookTitle: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Auteur"
              value={formData.bookAuthor}
              onChangeText={(text) => setFormData({ ...formData, bookAuthor: text })}
            />

            <TouchableOpacity
              style={styles.coverButton}
              onPress={pickCoverImage}
            >
              <Ionicons name="image-outline" size={24} color="#0ea5e9" />
              <Text style={styles.coverButtonText}>
                {selectedCoverUri ? 'Changer la couverture' : 'Ajouter une couverture'}
              </Text>
            </TouchableOpacity>

            {selectedCoverUri && (
              <View style={styles.coverPreviewContainer}>
                <Image
                  source={{ uri: selectedCoverUri }}
                  style={styles.coverPreview}
                />
                <TouchableOpacity
                  style={styles.removeCoverButton}
                  onPress={() => setSelectedCoverUri(null)}
                >
                  <Ionicons name="close-circle" size={28} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Note: {formData.rating}/5</Text>
            <View style={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setFormData({ ...formData, rating: star })}
                >
                  <Ionicons
                    name={star <= formData.rating ? 'star' : 'star-outline'}
                    size={40}
                    color="#fbbf24"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Votre avis (optionnel)"
              value={formData.review}
              onChangeText={(text) => setFormData({ ...formData, review: text })}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateReview}
            >
              <Text style={styles.submitButtonText}>Publier</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#0ea5e9',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  review: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748b',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 6,
    color: '#64748b',
    fontSize: 14,
  },
  modal: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  ratingInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  searchResults: {
    maxHeight: 300,
    marginTop: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchResultImage: {
    width: 48,
    height: 72,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  searchResultAuthor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  searchResultDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  selectedBookContainer: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  selectedBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  selectedBookInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  selectedBookImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
  },
  selectedBookText: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedBookLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  selectedBookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedBookAuthor: {
    fontSize: 14,
    color: '#64748b',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#94a3b8',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabActive: {
    backgroundColor: '#0ea5e9',
  },
  tabActiveGreen: {
    backgroundColor: '#22c55e',
  },
  tabActiveBlue: {
    backgroundColor: '#3b82f6',
  },
  tabActiveYellow: {
    backgroundColor: '#eab308',
  },
  tabActiveGray: {
    backgroundColor: '#6b7280',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  coverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    marginBottom: 12,
  },
  coverButtonText: {
    fontSize: 16,
    color: '#0ea5e9',
    marginLeft: 8,
    fontWeight: '600',
  },
  coverPreviewContainer: {
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
  },
  coverPreview: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeCoverButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
  },
  bookCoverImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
});

