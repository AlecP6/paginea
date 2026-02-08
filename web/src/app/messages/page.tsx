'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { messageApi, friendshipApi } from '@/lib/api';
import { Send, MessageCircle, User as UserIcon, Search, Plus, X, Smile, Trash2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Friend {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface Conversation {
  id: string;
  friend: Friend;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
  sender: Friend;
}

// Emojis populaires
const POPULAR_EMOJIS = ['😊', '😂', '❤️', '👍', '🎉', '😍', '🔥', '✨', '👏', '😢', '😮', '🤔', '😎', '🙏', '💪', '📚', '📖', '✅', '❌', '👋'];

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser, user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, router, loading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      // Rafraîchir les messages toutes les 5 secondes
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Scroll to bottom quand nouveaux messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messageApi.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await messageApi.getMessages(conversationId);
      setMessages(response.data);
      // Rafraîchir les conversations pour mettre à jour les compteurs non lus
      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const response = await friendshipApi.getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Erreur lors du chargement des amis');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleCreateConversation = async (friendId: string) => {
    try {
      const response = await messageApi.createConversation(friendId);
      setShowNewConversationModal(false);
      fetchConversations();
      // Sélectionner la nouvelle conversation
      const newConv = {
        id: response.data.id,
        friend: response.data.friend,
        lastMessage: null,
        unreadCount: 0,
        updatedAt: response.data.createdAt,
      };
      setSelectedConversation(newConv);
      toast.success('Conversation créée !');
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de la création de la conversation');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || sending) return;

    setSending(true);
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      const response = await messageApi.sendMessage(selectedConversation.id, newMessage);
      setMessages([...messages, response.data]);
      setNewMessage('');
      setShowEmojiPicker(false);
      fetchConversations(); // Rafraîchir pour mettre à jour le dernier message
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Supprimer ce message ?')) return;

    try {
      await messageApi.deleteMessage(messageId);
      setMessages(messages.filter(m => m.id !== messageId));
      fetchConversations();
      toast.success('Message supprimé');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.friend.firstName && conv.friend.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (conv.friend.lastName && conv.friend.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMessages = messageSearchQuery.trim()
    ? messages.filter((msg) =>
        msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
      )
    : messages;

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getDisplayName = (friend: Friend) => {
    if (friend.firstName && friend.lastName) {
      return `${friend.firstName} ${friend.lastName}`;
    }
    return friend.username;
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Liste des conversations - Sidebar */}
          <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* En-tête */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-7 h-7 text-primary-600" />
                  Messages
                </h2>
                <button
                  onClick={() => {
                    setShowNewConversationModal(true);
                    fetchFriends();
                  }}
                  className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors"
                  title="Nouvelle conversation"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un ami..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Liste des conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucune conversation</p>
                  <p className="text-sm mb-4">Créez une nouvelle conversation avec vos amis !</p>
                  <button
                    onClick={() => {
                      setShowNewConversationModal(true);
                      fetchFriends();
                    }}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau message
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      {conv.friend.avatar ? (
                        <Image
                          src={conv.friend.avatar}
                          alt={getDisplayName(conv.friend)}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {getDisplayName(conv.friend)}
                          </h3>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {conv.lastMessage.senderId === user?.id ? 'Vous: ' : ''}
                              {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="ml-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full font-semibold">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="hidden md:flex md:w-2/3 flex-col">
            {selectedConversation ? (
              <>
                {/* En-tête du chat */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedConversation.friend.avatar ? (
                        <Image
                          src={selectedConversation.friend.avatar}
                          alt={getDisplayName(selectedConversation.friend)}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {getDisplayName(selectedConversation.friend)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{selectedConversation.friend.username}
                          {isTyping && <span className="ml-2 text-primary-500">· en train d'écrire...</span>}
                        </p>
                      </div>
                    </div>

                    {/* Recherche dans messages */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm w-48"
                      />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {filteredMessages.map((message) => {
                    const isMe = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 relative ${
                              isMe
                                ? 'bg-primary-500 text-white rounded-br-none'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            {isMe && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p
                            className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                              isMe ? 'text-right' : 'text-left'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                            {isMe && message.isRead && ' · Lu'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Formulaire d'envoi */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-2xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-full focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                      maxLength={2000}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {newMessage.length}/2000
                  </p>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm mt-2 mb-4">Choisissez un ami pour commencer à discuter</p>
                  <button
                    onClick={() => {
                      setShowNewConversationModal(true);
                      fetchFriends();
                    }}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Nouvelle Conversation */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau message</h3>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingFriends ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucun ami pour le moment</p>
                  <p className="text-sm mt-2">Ajoutez des amis pour discuter !</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleCreateConversation(friend.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {friend.avatar ? (
                        <Image
                          src={friend.avatar}
                          alt={getDisplayName(friend)}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {getDisplayName(friend)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{friend.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
