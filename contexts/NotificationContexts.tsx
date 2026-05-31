// NotificationContexts - All components read from the same place
import { Notification } from "@/interfaces/notification";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  refresh: async () => {},
  markAllAsRead: async () => {},
});

// This components wraps the app (/tabs/_layout.tsx)
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const refresh = useCallback(async () => {
    try {
      const response = await getFetch("/api/notifications/me");
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await patchFetch("/api/notifications/me/read", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.log(e);
    }
  }, []);

  // Polling every 30 seconds so that we get update on notifications
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Calls refresh as soon as the app is mounted (so we doesn't have to wait 30 seconds)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, refresh, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
