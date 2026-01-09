import { useState, useEffect, useCallback } from 'react';
import { AQICategory, getAQILabel, getAQIColor } from '@/data/pollutionData';

export interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'seasonal';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  aqi?: number;
  category?: AQICategory;
  location?: string;
  icon?: string;
}

const STORAGE_KEY = 'vayuwatch_notifications';

// Seasonal alerts for India
const SEASONAL_ALERTS = [
  {
    type: 'seasonal' as const,
    title: 'Winter Air Quality Advisory',
    message: 'Temperature inversion expected tonight. AQI may rise significantly. Avoid early morning outdoor activities.',
    icon: '❄️',
  },
  {
    type: 'seasonal' as const,
    title: 'Stubble Burning Season',
    message: 'Crop residue burning in Punjab and Haryana may affect Delhi-NCR air quality over the next few days.',
    icon: '🔥',
  },
  {
    type: 'seasonal' as const,
    title: 'Diwali Air Quality Alert',
    message: 'Post-festival air quality typically deteriorates. Stock up on masks and limit outdoor exposure.',
    icon: '🪔',
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      });
    }

    return newNotification;
  }, []);

  // Generate AQI alert based on category
  const generateAQIAlert = useCallback((aqi: number, location: string) => {
    const category = aqi <= 50 ? 'good' :
                    aqi <= 100 ? 'satisfactory' :
                    aqi <= 200 ? 'moderate' :
                    aqi <= 300 ? 'poor' :
                    aqi <= 400 ? 'very-poor' : 'severe';

    if (category === 'poor' || category === 'very-poor' || category === 'severe') {
      const type = category === 'severe' ? 'alert' : 'warning';
      const title = category === 'severe' 
        ? '🚨 SEVERE Air Quality Alert'
        : category === 'very-poor'
        ? '⚠️ Very Poor Air Quality'
        : '⚠️ Poor Air Quality Alert';

      const message = category === 'severe'
        ? `Health emergency in ${location}! AQI at ${aqi}. Stay indoors, use air purifiers, and avoid all outdoor activities.`
        : category === 'very-poor'
        ? `Air quality in ${location} is very poor (AQI: ${aqi}). Sensitive groups should stay indoors. Use N95 masks if going outside.`
        : `Air quality in ${location} is poor (AQI: ${aqi}). Limit outdoor activities. Sensitive individuals should take precautions.`;

      addNotification({
        type,
        title,
        message,
        aqi,
        category: category as AQICategory,
        location,
      });
    }
  }, [addNotification]);

  // Add seasonal alert
  const addSeasonalAlert = useCallback(() => {
    const randomAlert = SEASONAL_ALERTS[Math.floor(Math.random() * SEASONAL_ALERTS.length)];
    addNotification({
      type: 'seasonal',
      title: randomAlert.icon + ' ' + randomAlert.title,
      message: randomAlert.message,
    });
  }, [addNotification]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    generateAQIAlert,
    addSeasonalAlert,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPermission,
  };
}
