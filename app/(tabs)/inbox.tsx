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
import { PickupRequest } from "@/interfaces/pickupRequest";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";
import { Message } from "@/interfaces/message";
import { Conversation } from "@/interfaces/conversation";
import { formatRelativeTime } from "@/utils/dateUtils";

type Tab = "notifications" | "messages";

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("notifications");

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
        {activeTab === "notifications" ? <RequestsList /> : <Messages />}
      </ScrollView>
    </View>
  );
}

function RequestsList() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, []),
  );

  const fetchRequests = async () => {
    try {
      const response = await getFetch("/api/pickups/incoming");
      if (!response.ok) {
        setError("Noget gik galt - prøv igen");
      }
      const requests = await response.json();
      setRequests(requests);
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Indlæser...</Text>;

  if (requests.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="file-tray-outline" size={48} color="#aaa" />
        <Text style={styles.emptyText}>Ingen nye anmodninger</Text>
      </View>
    );
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
        <Ionicons name="chatbubble-outline" size={48} color="#aaa" />
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
