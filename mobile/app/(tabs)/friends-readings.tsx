import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { bookReviewApi } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function FriendsReadingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendsReviews();
  }, []);

  const fetchFriendsReviews = async () => {
    try {
      setLoading(true);
      const response = await bookReviewApi.getReviews();
      // Filtrer pour afficher uniquement les critiques des amis (pas les siennes)
      const friendsReviews = response.data.filter((review: any) => review.author.id !== user?.id);
      setReviews(friendsReviews);
    } catch (error) {
      console.error('Fetch friends reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await bookReviewApi.unlikeReview(reviewId);
      } else {
        await bookReviewApi.likeReview(reviewId);
      }
      fetchFriendsReviews();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READ':
        return '#22c55e';
      case 'READING':
        return '#3b82f6';
      case 'WANT_TO_READ':
        return '#eab308';
      case 'ABANDONED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'READ':
        return 'Lu';
      case 'READING':
        return 'En cours';
      case 'WANT_TO_READ':
        return 'Envie de lire';
      case 'ABANDONED':
        return 'Abandonné';
      default:
        return status;
    }
  };

  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.review}>
      {/* En-tête avec auteur */}
      <View style={styles.reviewHeader}>
        {item.author.avatar ? (
          <Image
            source={{ uri: `http://localhost:3001${item.author.avatar}` }}
            style={styles.avatar}
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
      </View>

      {/* Couverture du livre */}
      {item.bookCover && (
        <Image
          source={{ uri: item.bookCover.startsWith('http') ? item.bookCover : `http://10.0.2.2:3001${item.bookCover}` }}
          style={styles.bookCoverImage}
        />
      )}

      {/* Informations du livre */}
      <Text style={styles.bookTitle}>{item.bookTitle}</Text>
      <Text style={styles.bookAuthor}>par {item.bookAuthor}</Text>

      {/* Note */}
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.rating ? 'star' : 'star-outline'}
              size={16}
              color="#fbbf24"
            />
          ))}
        </View>
        <Text style={styles.ratingText}>{item.rating}/5</Text>
      </View>

      {/* Badge statut */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {/* Avis */}
      {item.review && <Text style={styles.reviewText} numberOfLines={3}>{item.review}</Text>}

      {/* Actions */}
      <View style={styles.reviewActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id, item.isLiked)}
        >
          <Ionicons 
            name={item.isLiked ? 'heart' : 'heart-outline'} 
            size={20} 
            color={item.isLiked ? '#ef4444' : '#64748b'} 
          />
          <Text style={styles.actionText}>{item._count.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
          <Text style={styles.actionText}>{item._count.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Lectures de mes Amis</Text>
        <Text style={styles.headerSubtitle}>
          Découvrez ce que vos amis lisent
        </Text>
      </View>

      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchFriendsReviews} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="person-outline" size={48} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>Aucune lecture d'amis</Text>
          <Text style={styles.emptyText}>
            Ajoutez des amis pour découvrir leurs lectures !
          </Text>
          <TouchableOpacity 
            style={styles.addFriendsButton}
            onPress={() => router.push('/friends')}
          >
            <Text style={styles.addFriendsButtonText}>Trouver des amis</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  list: {
    padding: 16,
  },
  review: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFriendsButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookCoverImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
});

