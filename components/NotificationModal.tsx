import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
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
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
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


  useEffect(() => {
    if (isVisible) {
      setLoading(true);
      fetchNotifications();
      // Smooth slide up animation
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
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


  const renderNotification = ({ item }: { item: Notification }) => {
    const backgroundColor = item.read ? '#F5F6FA' : '#FFFFFF';
    const typeColors = {
      info: '#2652F9',
      success: '#4CAF50',
      warning: '#FFA000',
      error: '#F44336',
    };


    return (
      <TouchableOpacity
        style={[styles.notificationItem, { backgroundColor }]}
        onPress={() => {
          if (!item.read) markAsRead(item.id);
          // Handle notification press
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.typeIndicator, { backgroundColor: typeColors[item.type] }]} />
        <View style={styles.notificationContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
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
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            {
              paddingBottom: insets.bottom || 16,
              transform: [{ translateY }],
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>


          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2652F9" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications</Text>
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
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAEE',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#100F15',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#4A4A4D',
    fontFamily: 'Inter-Medium',
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EAEE',
    shadowColor: "#100F15",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  typeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#100F15',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4A4A4D',
    marginBottom: 8,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9199B1',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9199B1',
  },
});
