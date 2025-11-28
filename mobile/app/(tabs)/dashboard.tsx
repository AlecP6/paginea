import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { postApi, commentApi } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postApi.getPosts({ type: 'PUBLIC' });
      setPosts(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      await postApi.createPost({ content: newPost, type: 'PUBLIC' });
      setNewPost('');
      fetchPosts();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la publication');
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await postApi.unlikePost(postId);
      } else {
        await postApi.likePost(postId);
      }
      fetchPosts();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du like');
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      'Supprimer le post',
      'Êtes-vous sûr de vouloir supprimer ce post ?',
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
              await postApi.deletePost(postId);
              fetchPosts();
              Alert.alert('Succès', 'Post supprimé !');
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      try {
        const response = await postApi.getPostById(postId);
        setPosts(posts.map(p => p.id === postId ? response.data : p));
      } catch (error) {
        Alert.alert('Erreur', 'Erreur lors du chargement des commentaires');
      }
    }
  };

  const handleCreateComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      await commentApi.createComment({ content, postId });
      setNewComment({ ...newComment, [postId]: '' });
      const response = await postApi.getPostById(postId);
      setPosts(posts.map(p => p.id === postId ? response.data : p));
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    Alert.alert(
      'Supprimer',
      'Supprimer ce commentaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentApi.deleteComment(commentId);
              const response = await postApi.getPostById(postId);
              setPosts(posts.map(p => p.id === postId ? response.data : p));
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        {item.author.avatar ? (
          <Image source={{ uri: item.author.avatar.startsWith('http') ? item.author.avatar : `http://10.0.2.2:3001${item.author.avatar}` }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.author.username[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.postHeaderInfo}>
          <Text style={styles.authorName}>
            {item.author.username}
          </Text>
          <Text style={styles.postDate}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        {user && item.author.id === user.id && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePost(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
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
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleComments(item.id)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={expandedPostId === item.id ? '#0ea5e9' : '#64748b'}
          />
          <Text style={[styles.actionText, expandedPostId === item.id && { color: '#0ea5e9' }]}>
            {item._count.comments}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Commentaires */}
      {expandedPostId === item.id && (
        <View style={styles.commentsSection}>
          {/* Liste des commentaires */}
          {item.comments && item.comments.length > 0 && (
            <View style={styles.commentsList}>
              {item.comments.map((comment: any) => (
                <View key={comment.id} style={styles.comment}>
                  {comment.author.avatar ? (
                    <Image source={{ uri: comment.author.avatar.startsWith('http') ? comment.author.avatar : `http://10.0.2.2:3001${comment.author.avatar}` }} style={styles.commentAvatarImage} />
                  ) : (
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.author.username[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentInfo}>
                        <Text style={styles.commentAuthor}>
                          {comment.author.username}
                        </Text>
                        <Text style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      {user && comment.author.id === user.id && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id, item.id)}
                        >
                          <Ionicons name="close" size={16} color="#64748b" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Formulaire nouveau commentaire */}
          <View style={styles.newCommentForm}>
            <TextInput
              style={styles.commentInput}
              value={newComment[item.id] || ''}
              onChangeText={(text) =>
                setNewComment({ ...newComment, [item.id]: text })
              }
              placeholder="Écrire un commentaire..."
              onSubmitEditing={() => handleCreateComment(item.id)}
            />
            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => handleCreateComment(item.id)}
            >
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paginea</Text>
      </View>

      <View style={styles.createPost}>
        <TextInput
          style={styles.input}
          value={newPost}
          onChangeText={setNewPost}
          placeholder="Quoi de neuf sur vos lectures ?"
          multiline
        />
        <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
        refreshing={loading}
        onRefresh={fetchPosts}
      />
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
    color: '#0ea5e9',
  },
  createPost: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minHeight: 50,
  },
  postButton: {
    backgroundColor: '#0ea5e9',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsList: {
    padding: 16,
  },
  post: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
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
  postHeaderInfo: {
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
  postDate: {
    fontSize: 12,
    color: '#64748b',
  },
  postContent: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 12,
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
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  commentsList: {
    marginBottom: 12,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  commentDate: {
    fontSize: 11,
    color: '#64748b',
  },
  commentText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  newCommentForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  commentButton: {
    backgroundColor: '#0ea5e9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

