import { useEffect, useRef } from 'react';
import { useAuth } from '../../store/authSlice';
import API from '../../services/api';
import { auth } from '../../firebase/config';

/**
 * SessionTracker
 * Marks user active status once per session upon initial login or page visit.
 * Does not run repeatedly or poll the backend in the background.
 */
export default function SessionTracker() {
  const { isLoggedIn, user } = useAuth();
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      hasSentRef.current = false;
      return;
    }

    const userId = user._id || user.uid || user.firebaseUid || user.email;
    if (!userId) return;

    // Use sessionStorage to ensure it fires strictly once per browser session for this user
    const sessionKey = `heartbeat_synced_${userId}`;
    if (hasSentRef.current || sessionStorage.getItem(sessionKey)) {
      return;
    }

    const sendInitialHeartbeat = async () => {
      try {
        if (auth && typeof auth.authStateReady === 'function') {
          await auth.authStateReady();
        }
        if (!auth?.currentUser && !localStorage.getItem('accessToken')) {
          return;
        }

        hasSentRef.current = true;
        sessionStorage.setItem(sessionKey, 'true');

        await API.post('/auth/heartbeat', { seconds: 5 });
      } catch (err) {
        // Silently catch to avoid unhandled rejections
      }
    };

    sendInitialHeartbeat();
  }, [isLoggedIn, user]);

  return null;
}
