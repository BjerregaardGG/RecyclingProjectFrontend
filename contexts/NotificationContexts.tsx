import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AppState } from "react-native";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { Notification } from "@/interfaces/notification";

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
      console.log(data);
      setNotifications(data);
    } catch (e) {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await patchFetch("/api/notifications/me/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
