// app/(tabs)/inbox.tsx
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
import { formatRelativeTime } from "@/utils/dateUtils";

type Tab = "requests" | "messages";

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Indbakke</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.tabActive]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.tabTextActive,
            ]}
          >
            Anmodninger
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
        {activeTab === "requests" ? <RequestsList /> : <MessagesList />}
      </ScrollView>
    </View>
  );
}

/* ---------------- Anmodninger ---------------- */

function RequestsList() {
  // Placeholder data – erstatter med rigtig data senere
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

  const acceptRequest = async (requestId: number) => {
    try {
      const response = await patchFetch(`/api/pickups/${requestId}/accept`);

      if (!response.ok) {
        setError("Noget gik galt - prøv igen");
      }
      const acceptedRequest = await response.json();
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      const response = await patchFetch(`/api/pickups/${requestId}/decline`);

      if (!response.ok) {
        setError("Noget gik galt - prøv igen");
      }
      const declineRequest = await response.json();
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch {
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

  return (
    <View style={styles.list}>
      {requests.map((req) => (
        <View key={req.id} style={styles.requestCard}>
          <Image source={{ uri: req.itemImage }} style={styles.requestImage} />
          <View style={styles.requestInfo}>
            <Text style={styles.requestName}>{req.itemName}</Text>
            <Text style={styles.requestSubtext}>
              {req.requesterName} vil afhente
            </Text>
            <Text style={styles.requestTime}>
              {formatRelativeTime(req.createdAt)}
            </Text>
          </View>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => acceptRequest(req.id)}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => declineRequest(req.id)}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ---------------- Beskeder ---------------- */

function MessagesList() {
  const messages = [
    {
      id: 1,
      userName: "Bo",
      userImage: "https://placehold.co/100",
      lastMessage: "Hej, jeg kan komme forbi i morgen kl. 14",
      time: "10 min",
      unread: true,
    },
    {
      id: 2,
      userName: "Anna",
      userImage: "https://placehold.co/100",
      lastMessage: "Tak for stolen!",
      time: "1 dag",
      unread: false,
    },
  ];

  if (messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="chatbubble-outline" size={48} color="#aaa" />
        <Text style={styles.emptyText}>Ingen beskeder endnu</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {messages.map((msg) => (
        <TouchableOpacity key={msg.id} style={styles.messageCard}>
          <Image source={{ uri: msg.userImage }} style={styles.messageImage} />
          <View style={styles.messageInfo}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageName}>{msg.userName}</Text>
              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
            <Text
              style={[
                styles.messagePreview,
                msg.unread && styles.messagePreviewUnread,
              ]}
              numberOfLines={1}
            >
              {msg.lastMessage}
            </Text>
          </View>
          {msg.unread && <View style={styles.unreadDot} />}
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

  /* Request card */
  requestCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  requestImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c2c2c",
    marginBottom: 2,
  },
  requestSubtext: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 11,
    color: "#888",
  },
  requestActions: {
    flexDirection: "row",
    gap: 6,
  },
  acceptButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e24b4a",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Message card */
  messageCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  messageImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eee",
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  messageName: {
    fontSize: 14,
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
  },
  messagePreviewUnread: {
    color: "#2c2c2c",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3a7d3a",
  },
});
