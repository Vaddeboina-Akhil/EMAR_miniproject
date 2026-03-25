import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from backend
      const mockNotifications = [
        {
          id: Date.now(),
          type: 'record_added',
          title: 'New prescription added',
          message: 'Amlodipine 5mg added by Dr. Sarah Johnson',
          read: false,
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now() - 1,
          type: 'consent_request',
          title: 'Consent request pending',
          message: 'Dr. Raj Patel requests access to blood test results',
          read: true,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? {...n, read: true} : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
