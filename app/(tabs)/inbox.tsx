// This is the tab for inbox (Messages - Notifications)
import { LoadingScreen } from "@/components/LoadingScreen";
import { Mascot } from "@/components/Mascot";
import { useNotifications } from "@/contexts/NotificationContexts";
import { Conversation } from "@/interfaces/conversation";
import { formatRelativeTime } from "@/utils/dateUtils";
import { getFetch } from "@/utils/fetchUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Tab = "notifications" | "messages";

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("notifications");
  const { notifications } = useNotifications();

  const hasUnreadMessages = notifications.some(
    (n) => n.type === "NEW_MESSAGE" && !n.isRead,
  );
  const hasUnreadNotifications = notifications.some(
    (n) => n.type !== "NEW_MESSAGE" && !n.isRead,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Indbakke</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "notifications" && styles.tabActive,
          ]}
          onPress={() => setActiveTab("notifications")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "notifications" && styles.tabTextActive,
              hasUnreadNotifications && styles.tabTextBold,
            ]}
          >
            Notifikationer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "messages" && styles.tabActive]}
          onPress={() => setActiveTab("messages")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "messages" && styles.tabTextActive,
              hasUnreadMessages && styles.tabTextBold,
            ]}
          >
            Beskeder
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "notifications" ? <NotificationsList /> : <Messages />}
      </ScrollView>
    </View>
  );
}

function NotificationsList() {
  const { notifications, refresh, markAllAsRead } = useNotifications();
  const router = useRouter();

  const visibleNotifications = notifications.filter(
    (n) => n.type !== "NEW_MESSAGE",
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
      markAllAsRead();
    }, [refresh, markAllAsRead]),
  );

  const handleTap = (notification: (typeof notifications)[number]) => {
    if (!notification.relatedId) return;

    // Route based on notification type
    switch (notification.type) {
      case "PICKUP_REQUEST":
      case "REQUEST_ACCEPTED":
      case "PICKUP_COMPLETED":
        router.push({
          pathname: "/pickup/[id]",
          params: {
            id: notification.relatedId.toString(),
            userId: notification.otherUserId.toString(),
          },
        });
        break;
      case "NEW_REVIEW":
        router.push({
          pathname: "/review/[id]",
          params: {
            id: notification.relatedId.toString(),
            pickupId: notification.relatedId.toString(),
          },
        });
        break;
      case "INCOMING_REVIEW":
        router.push({
          pathname: "/reviews/[userId]",
          params: {
            userId: notification.userId.toString(),
          },
        });
        break;
    }
  };

  if (visibleNotifications.length === 0) {
    return (
      <View style={styles.empty}>
        <Mascot mood="happy" size={140} />
        <Text style={styles.emptyText}>Ingen notifikationer endnu</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {/*Notification list*/}
      {visibleNotifications.map((n) => (
        <TouchableOpacity
          key={n.id}
          style={[
            styles.notificationCard,
            !n.isRead && styles.notificationCardUnread,
          ]}
          onPress={() => handleTap(n)}
        >
          <View style={styles.notificationIcon}>
            <Ionicons name={getIconForType(n.type)} size={20} color="#3a7d3a" />
          </View>

          <View style={styles.notificationContent}>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {n.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatRelativeTime(n.createdAt)}
            </Text>
          </View>

          {!n.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Creates icon based on notification type
function getIconForType(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "PICKUP_REQUEST":
      return "hand-left-outline";
    case "REQUEST_ACCEPTED":
      return "checkmark-circle-outline";
    case "REQUEST_DECLINED":
      return "close-circle-outline";
    case "PICKUP_COMPLETED":
      return "checkmark-done-outline";
    case "NEW_REVIEW":
      return "star-outline";
    case "INCOMING_REVIEW":
      return "star";
    default:
      return "notifications-outline";
  }
}

function Messages() {
  const [conversations, setConversation] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, []),
  );

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchConversations()]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await getFetch("/api/messages/conversations/me");
      if (!response.ok) return;
      const conversations = await response.json();
      setConversation(conversations);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <LoadingScreen message="Henter dine beskeder" />;
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.empty}>
        <Mascot mood="happy" size={140} />
        <Text style={styles.emptyText}>Ingen beskeder endnu</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {/*Conversation list*/}
      {conversations.map((con) => (
        <TouchableOpacity
          key={con.pickupId}
          style={styles.messageCard}
          onPress={() =>
            router.push({
              pathname: "/chat/[pickupId]",
              params: {
                pickupId: con.pickupId.toString(),
                otherName: con.otherUserName,
                otherImage: con.otherUserImage,
                otherUserId: con.otherUserId.toString(),
                pickupImage: con.itemImage,
                pickupTitle: con.itemName,
              },
            })
          }
        >
          <View style={styles.avatar}>
            {con.otherUserImage ? (
              <Image
                source={{ uri: con.otherUserImage }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {con.itemName?.substring(0, 1).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.messageInfo}>
            <Text style={styles.messageName}>{con.otherUserName}</Text>
            <Text
              style={[
                styles.messagePreview,
                con.unreadCount > 0 && styles.messagePreviewUnread,
              ]}
              numberOfLines={1}
            >
              {con.lastMessageContent ?? "Ingen beskeder endnu"}
            </Text>
            <Text style={styles.messageTime}>
              {formatRelativeTime(con.lastMessageAt)}
            </Text>
          </View>
          <View style={styles.messageRight}>
            <Image source={{ uri: con.itemImage }} style={styles.itemImage} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  header: {
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 2,
  },
  tabTextBold: {
    fontWeight: "700",
    color: "#031303",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#3a7d3a",
  },
  tabText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#3a7d3a",
  },
  content: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  notificationCardUnread: {
    backgroundColor: "#f0f7f0",
    borderColor: "#c8e6c9",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f3e8",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#2c2c2c",
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: "#888",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3a7d3a",
  },
  messageCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    alignItems: "flex-start",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  messageInfo: {
    flex: 2,
  },
  messageRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  messageName: {
    fontSize: 14,
    marginTop: 1,
    fontWeight: "500",
    color: "#2c2c2c",
  },
  messageTime: {
    marginTop: 4,
    fontSize: 11,
    color: "#888",
  },
  messagePreview: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
  },
  messagePreviewUnread: {
    color: "#2c2c2c",
    fontWeight: "500",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2e7d32",
  },
});
