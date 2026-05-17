import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFetch } from "@/utils/fetchUtils";
import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";
import { Conversation } from "@/interfaces/conversation";
import { formatRelativeTime } from "@/utils/dateUtils";
import { Mascot } from "@/components/Mascot";
import { useNotifications } from "@/contexts/NotificationContexts";

type Tab = "notifications" | "messages";

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("notifications");
  const { unreadCount } = useNotifications();

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
  const [error, setError] = useState("");
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refresh();
      markAllAsRead();
    }, [refresh, markAllAsRead]),
  );

  const handleTap = (notification: (typeof notifications)[number]) => {
    if (!notification.relatedId) return;

    switch (notification.type) {
      case "PICKUP_REQUEST":
      case "REQUEST_ACCEPTED":
      case "REQUEST_DECLINED":
      case "PICKUP_COMPLETED":
        router.push({
          pathname: "/pickup/[id]",
          params: {
            id: notification.relatedId.toString(),
            userId: notification.otherUserId.toString(),
          },
        });
        break;
      case "NEW_MESSAGE":
        router.push({
          pathname: "/chat/[pickupId]",
          params: {
            pickupId: notification.relatedId.toString(),
          },
        });
        break;
    }
  };

  if (notifications.length === 0) {
    return (
      <View style={styles.empty}>
        <Mascot mood="happy" size={140} />
        <Text style={styles.emptyText}>Ingen notifikationer endnu</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {notifications.map((n) => (
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
    case "NEW_MESSAGE":
      return "chatbubble-outline";
    default:
      return "notifications-outline";
  }
}

function Messages() {
  const [conversations, setConversation] = useState<Conversation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, []),
  );

  const fetchConversations = async () => {
    try {
      const response = await getFetch("/api/messages/conversations/me");
      if (!response.ok) {
        setError("Noget gik galt - prøv igen");
      }
      const conversations = await response.json();
      console.log(conversations);
      setConversation(conversations);
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

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
          <Image
            source={{ uri: con.otherUserImage }}
            style={styles.messageImage}
          />
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
          </View>
          <View style={styles.messageRight}>
            <Text style={styles.messageTime}>
              {formatRelativeTime(con.lastMessageAt)}
            </Text>
            <Image source={{ uri: con.itemImage }} style={styles.itemImage} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  header: {
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 2,
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
  // Notifikations-kort
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

  // Tab badge
  tabLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabBadge: {
    backgroundColor: "#e24b4a",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
  /* Message card */
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
  messageImage: {
    marginTop: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eee",
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
});
