// app/(tabs)/inbox.tsx
import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PickupRequest } from "@/interfaces/pickupRequest";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { useFocusEffect } from "expo-router";
import { formatRelativeTime } from "@/utils/dateUtils";
import { useRouter } from "expo-router";
import { getTimeRemaining, useCountdown, isExpired } from "@/utils/dateUtils";

type Tab = "received" | "sent";
// forces re-render every minute so that time remaining updates

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("received");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Snatches</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.tabActive]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.tabTextActive,
            ]}
          >
            Modtaget
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.tabActive]}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sent" && styles.tabTextActive,
            ]}
          >
            Afsendte
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "received" ? <ReceivedList /> : <SentList />}
      </ScrollView>
    </View>
  );
}

/* ---------------- Recieved Requests ---------------- */
function ReceivedList() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useCountdown();

  useFocusEffect(
    useCallback(() => {
      fetchReceivedRequests();
    }, []),
  );

  const fetchReceivedRequests = async () => {
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

  const handleAccept = async (id: number) => {
    try {
      const response = await patchFetch(`/api/pickups/${id}/accept`);
      if (!response.ok) return;
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "ACCEPTED" } : req,
        ),
      );
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    }
  };

  const handleReject = async (id: number) => {
    Alert.alert(
      "Afvis anmodning?",
      "Er du sikker? Anmodningen kan ikke gendannes.",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Afvis",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await patchFetch(`/api/pickups/${id}/decline`);
              if (!response.ok) return;
              router.back();
            } catch (error) {
              setError("Noget gik galt – prøv igen");
            }
          },
        },
      ],
    );
  };

  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) return <Text style={styles.loadingText}>Indlæser...</Text>;

  if (requests.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="file-tray-outline" size={48} color="#aaa" />
        <Text style={styles.emptyText}>Ingen modtagne anmodninger</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sortedRequests.map((req) => {
        const isAccepted = req.status === "ACCEPTED";
        const expired = isExpired(req?.expiresAt);

        return (
          <TouchableOpacity
            key={req.id}
            style={[
              styles.requestCard,
              isAccepted && styles.requestCardAccepted,
              isAccepted && expired && styles.expired,
            ]}
            onPress={() =>
              router.push({
                pathname: "/pickup/[id]",
                params: {
                  id: req.id,
                  userId: req.requesterId,
                },
              })
            }
          >
            <Image
              source={{ uri: req.itemImage }}
              style={styles.requestImage}
            />

            <View style={styles.requestInfo}>
              <Text style={styles.requestName}>{req.itemName}</Text>
              <Text style={styles.requestSubtext}>
                {req.requesterName}{" "}
                {expired
                  ? "har ikke afhentet"
                  : isAccepted
                    ? "afhenter snart"
                    : "vil gerne afhente"}
              </Text>
              <Text style={styles.requestTime}>
                {isAccepted
                  ? getTimeRemaining(req.expiresAt)
                  : formatRelativeTime(req.createdAt)}
              </Text>
            </View>

            {!isAccepted && (
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(req.id)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(req.id)}
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {isAccepted && !expired && (
              <View style={styles.acceptedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#3a7d3a" />
              </View>
            )}
            {isAccepted && expired && (
              <View style={styles.acceptedBadge}>
                <Ionicons name="hourglass-outline" size={20} color="#b14343" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ---------------- Sent requests ---------------- */
function SentList() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useCountdown();

  useFocusEffect(
    useCallback(() => {
      fetchOutgoingRequests();
    }, []),
  );

  const fetchOutgoingRequests = async () => {
    try {
      const response = await getFetch(`/api/pickups/outgoing`);

      if (!response.ok) setError("Noget gik galt - prøv igen");

      const requests = await response.json();
      console.log(requests);
      setRequests(requests);
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) return <Text style={styles.loadingText}>Indlæser...</Text>;

  if (requests.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="file-tray-outline" size={48} color="#aaa" />
        <Text style={styles.emptyText}>Ingen afsendte anmodninger</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sortedRequests.map((req) => {
        const isAccepted = req.status === "ACCEPTED";
        const expired = isExpired(req?.expiresAt);

        return (
          <TouchableOpacity
            key={req.id}
            style={[
              styles.requestCard,
              isAccepted && styles.requestCardAccepted,
              isAccepted && expired && styles.expired,
            ]}
            onPress={() =>
              router.push({
                pathname: "/pickup/[id]",
                params: {
                  id: req.id,
                  userId: req.ownerId,
                },
              })
            }
          >
            <Image
              source={{ uri: req.itemImage }}
              style={styles.requestImage}
            />

            <View style={styles.requestInfo}>
              <Text style={styles.requestName}>{req.itemName}</Text>
              <Text style={styles.requestSubtext}>
                {expired
                  ? "Du har ikke afhentet"
                  : isAccepted
                    ? "Accepteret"
                    : "Ikke accepteret endnu"}
              </Text>
              <Text style={styles.requestTime}>
                {isAccepted
                  ? getTimeRemaining(req.expiresAt)
                  : formatRelativeTime(req.createdAt)}
              </Text>
            </View>

            {!isAccepted && <View style={styles.requestActions}></View>}

            {isAccepted && !expired && (
              <View style={styles.acceptedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#3a7d3a" />
              </View>
            )}
            {isAccepted && expired && (
              <View style={styles.acceptedBadge}>
                <Ionicons name="hourglass-outline" size={20} color="#b14343" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
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
  requestCardAccepted: {
    backgroundColor: "#f0f7f0",
    borderColor: "#3a7d3a",
    borderWidth: 1,
  },
  expired: {
    backgroundColor: "#f0f7f0",
    borderColor: "#b14343",
    borderWidth: 1,
  },
  acceptedBadge: {
    paddingHorizontal: 4,
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
  loadingText: {
    textAlign: "center",
    paddingVertical: 40,
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
});
