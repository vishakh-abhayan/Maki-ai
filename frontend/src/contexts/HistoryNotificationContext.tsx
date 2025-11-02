import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface HistoryNotificationContextType {
  hasNewConversations: boolean;
  unreadCount: number;
  markAsRead: () => void;
  updateNotificationState: (count: number) => void;
  getLastVisitTime: () => number;
}

const HistoryNotificationContext = createContext<HistoryNotificationContextType | undefined>(undefined);

const LAST_VISIT_KEY = 'history_last_visit';

export const HistoryNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [hasNewConversations, setHasNewConversations] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get user-specific storage key
  const getStorageKey = (key: string) => {
    return user?.id ? `${key}_${user.id}` : key;
  };

  // Load last visit time from localStorage
  const getLastVisitTime = useCallback((): number => {
    const key = getStorageKey(LAST_VISIT_KEY);
    const lastVisit = localStorage.getItem(key);
    return lastVisit ? parseInt(lastVisit, 10) : 0;
  }, [user?.id]);

  // Save last visit time to localStorage
  const saveLastVisitTime = useCallback((timestamp: number) => {
    const key = getStorageKey(LAST_VISIT_KEY);
    localStorage.setItem(key, timestamp.toString());
  }, [user?.id]);

  // Mark conversations as read (update last visit time)
  const markAsRead = useCallback(() => {
    const now = Date.now();
    saveLastVisitTime(now);
    setHasNewConversations(false);
    setUnreadCount(0);
  }, [saveLastVisitTime]);

  // Update notification state (called from History page)
  const updateNotificationState = useCallback((count: number) => {
    setUnreadCount(count);
    setHasNewConversations(count > 0);
  }, []);

  return (
    <HistoryNotificationContext.Provider
      value={{
        hasNewConversations,
        unreadCount,
        markAsRead,
        updateNotificationState,
        getLastVisitTime,
      }}
    >
      {children}
    </HistoryNotificationContext.Provider>
  );
};

export const useHistoryNotification = () => {
  const context = useContext(HistoryNotificationContext);
  if (context === undefined) {
    throw new Error('useHistoryNotification must be used within a HistoryNotificationProvider');
  }
  return context;
};

