import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useDataRefresh } from '@/contexts/DataRefreshContext';
import { useHistoryNotification } from '@/contexts/HistoryNotificationContext';
import { useLocation } from 'react-router-dom';

// This component checks for new conversations when refreshTrigger changes
// It only checks if we're NOT on the history page (since History page handles its own check)
const HistoryNotificationChecker = () => {
  const { getToken } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const { updateNotificationState, getLastVisitTime } = useHistoryNotification();
  const location = useLocation();

  useEffect(() => {
    // Skip checking if we're on the history page - it will handle its own check
    if (location.pathname === '/history' || location.pathname.startsWith('/history/')) {
      return;
    }

    const checkForNewConversations = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const result = await response.json();
        const conversations = result.success && result.data ? result.data : result;

        if (!Array.isArray(conversations)) {
          return;
        }

        const lastVisitTime = getLastVisitTime();
        const newConversations = conversations.filter((conv: { date: string }) => {
          const convDate = new Date(conv.date).getTime();
          return convDate > lastVisitTime;
        });

        updateNotificationState(newConversations.length);
      } catch (error) {
        console.error('Error checking for new conversations:', error);
      }
    };

    // Small delay to ensure the conversation is saved on the backend
    const timeoutId = setTimeout(() => {
      checkForNewConversations();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [refreshTrigger, location.pathname, getToken, getLastVisitTime, updateNotificationState]);

  return null;
};

export default HistoryNotificationChecker;

