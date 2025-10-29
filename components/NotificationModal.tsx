import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface Notification {
  id: string;
  title: string;
  message: string;
  body?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  nav_path?: string;
}

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isVisible, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      setLoading(true);
      fetchNotifications();
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const fetchNotifications = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Notification fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Could not load notifications',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error: any) {
      console.error('Mark as read error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Could not update notification',
      });
    }
  };

  const handleNotificationPress = (item: Notification) => {
    if (!item.read) markAsRead(item.id);
    if (item.nav_path) {
      onClose();
      router.push(item.nav_path as any);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ⓘ';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const typeColors = {
      info: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    };

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.6}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${typeColors[item.type]}15` }]}>
          <Text style={[styles.iconText, { color: typeColors[item.type] }]}>
            {getTypeIcon(item.type)}
          </Text>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </View>
          
          <Text style={styles.message} numberOfLines={2}>
            {item.body || item.message}
          </Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType="none"
      transparent={true}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContent,
          {
            paddingBottom: Math.max(insets.bottom, 20),
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Handle bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Notifications</Text>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('@/assets/navigation/close.png')}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You’re all caught up!
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notificationsList}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C6C6C8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    letterSpacing: 0.35,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 12,
    height: 12,
    tintColor: '#8E8E93',
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentWrapper: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    letterSpacing: -0.24,
    marginRight: 8,
  },
  time: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    letterSpacing: -0.08,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3C3C43',
    lineHeight: 20,
    letterSpacing: -0.15,
    opacity: 0.8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 4,
  },
  centerContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(120, 120, 128, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 0.38,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    letterSpacing: -0.24,
  },
});
