import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { PickupRequest } from "@/interfaces/pickupRequest";
import { User } from "@/interfaces/user";
import { useCallback } from "react";
import { getTimeRemaining, useCountdown, isExpired } from "@/utils/dateUtils";

export default function PickupDetailScreen() {
  const { id, userId } = useLocalSearchParams();
  const router = useRouter();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);

  // forces re-render every minute so that time remaining updates
  useCountdown();

  useFocusEffect(
    useCallback(() => {
      fetchRequest();
      fetchUser();
    }, []),
  );

  const fetchRequest = async () => {
    try {
      const response = await getFetch(`/api/pickups/${id}`);
      if (!response.ok) {
        setError("Kunne ikke hente anmodning");
        return;
      }
      const data = await response.json();
      setRequest(data);
      console.log(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await getFetch(`/api/users/${userId}`);

      if (!response.ok) {
        setError("Kunne ikke finde brugeren");
      }

      const userData = await response.json();
      setOtherUser(userData);
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      const response = await patchFetch(`/api/pickups/${id}/accept`);
      if (!response.ok) return;
      const updated = await response.json();
      setRequest(updated);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    }
  };

  const handleReject = async () => {
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

  const handleConfirm = async () => {
    try {
      console.log(id);
      const response = await patchFetch(`/api/pickups/${id}/confirm`);
      if (!response.ok) {
        setError("Noget gik galt - prøv igen");
        router.back();
      }

      const data = await response.json();
      console.log(data);
      setRequest(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Indlæser...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.centered}>
        <Text>Anmodning ikke fundet</Text>
      </View>
    );
  }

  if (!otherUser) {
    return (
      <View style={styles.centered}>
        <Text>Bruger ikke fundet</Text>
      </View>
    );
  }

  const isPending = request.status === "PENDING";
  const isAccepted = request.status === "ACCEPTED";
  const isCompleted = request.status === "COMPLETED";
  const isOwner =
    otherUser != null && request != null && otherUser.id !== request.ownerId;
  const expired = isExpired(request?.expiresAt);
  const myConfirmation = isOwner
    ? request.ownerConfirmedAt
    : request.requesterConfirmedAt;
  const otherConfirmation = isOwner
    ? request.requesterConfirmedAt
    : request.ownerConfirmedAt;

  return (
    <ScrollView style={styles.container}>
      {/* Tilbage knap */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Billede */}
      <Image source={{ uri: request.itemImage }} style={styles.image} />

      {/* Hoved sektion */}
      <View style={styles.section}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.name}>{request.itemName}</Text>

        {/* Status badge */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              isPending && styles.statusDotPending,
              isAccepted && styles.statusDotAccepted,
              isCompleted && styles.statusDotCompleted,
            ]}
          />
          <Text style={styles.statusText}>
            {isPending && "Afventer dit svar"}
            {isAccepted && "Accepteret"}
            {request.status === "REJECTED" && "Afvist"}
            {request.status === "COMPLETED" && "Afhentet"}
            {request.status === "EXPIRED" && "Udløbet"}
          </Text>
        </View>
        {isAccepted && request.expiresAt && (
          <View style={[styles.countdownSection]}>
            <Ionicons
              name="time-outline"
              size={16}
              color={expired ? "#e24b4a" : "#3a7d3a"}
            />
            <Text
              style={[
                styles.countdownText,
                expired && styles.countdownTextExpired,
              ]}
            >
              {getTimeRemaining(request.expiresAt)}
            </Text>
          </View>
        )}
      </View>

      {/* User section */}
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/user/[id]",
            params: {
              id: isOwner ? request.requesterId : request.ownerId,
            },
          });
        }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bruger</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {request.requesterName?.substring(0, 1).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{otherUser?.name}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Adresse sektion (kun når accepteret) */}
      {isAccepted && request.pickupAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Afhentningsadresse</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#3a7d3a" />
            <Text style={styles.locationText}>{request.pickupAddress}</Text>
          </View>
        </View>
      )}

      {/* Knapper baseret på status */}
      <View style={styles.buttonSection}>
        {isPending && isOwner && (
          <>
            <TouchableOpacity style={styles.button} onPress={handleAccept}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.buttonText}>Acceptér</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonReject]}
              onPress={handleReject}
            >
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.buttonText}>Afvis</Text>
            </TouchableOpacity>
          </>
        )}

        {isPending && !isOwner && (
          <View style={styles.waitingBox}>
            <Ionicons name="time-outline" size={20} color="#888" />
            <Text style={styles.waitingText}>Afventer ejerens svar...</Text>
          </View>
        )}

        {isAccepted && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.push({
                  pathname: "/chat/[pickupId]",
                  params: {
                    pickupId: request.id.toString(),
                    otherName: isOwner
                      ? request.requesterName
                      : request.ownerName,
                    otherImage: otherUser.image,
                    pickupImage: request.itemImage,
                    pickupTitle: request.itemName,
                  },
                });
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Skriv til {otherUser?.name}</Text>
            </TouchableOpacity>

            {isAccepted && !myConfirmation && (
              <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Marker som afhentet</Text>
              </TouchableOpacity>
            )}

            {isAccepted && myConfirmation && !otherConfirmation && (
              <View style={styles.waitingBox}>
                <Ionicons name="time-outline" size={20} color="#888" />
                <Text style={styles.waitingText}>
                  Afventer bekræftelse fra {otherUser.name}...
                </Text>
              </View>
            )}

            {request.status === "COMPLETED" && (
              <View style={styles.completedBox}>
                <Ionicons name="checkmark-circle" size={20} color="#3a7d3a" />
                <Text style={styles.completedText}>Afhentet ✓</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
  },
  image: {
    width: "100%",
    height: 300,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
  },
  name: {
    fontSize: 22,
    fontWeight: "500",
    color: "#2c2c2c",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#888",
  },
  statusDotPending: {
    backgroundColor: "#f5a623",
  },
  statusDotAccepted: {
    backgroundColor: "#3a7d3a",
  },
  statusDotCompleted: {
    backgroundColor: "#32719b",
  },
  statusText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  countdownSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  countdownText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "600",
  },
  countdownTextExpired: {
    color: "#d65d5d",
    fontWeight: "600",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2e7d32",
  },
  userName: {
    fontSize: 14,
    color: "#2c2c2c",
    fontWeight: "500",
  },
  requestTime: {
    fontSize: 12,
    color: "#888",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#2c2c2c",
  },
  buttonSection: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  button: {
    backgroundColor: "#3a7d3a",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buttonReject: {
    backgroundColor: "#e24b4a",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3a7d3a",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  buttonTextSecondary: {
    color: "#3a7d3a",
    fontSize: 15,
    fontWeight: "500",
  },
  error: {
    color: "#e24b4a",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  waitingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  waitingText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  completedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f0f7f0",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3a7d3a",
  },
  completedText: {
    fontSize: 14,
    color: "#3a7d3a",
    fontWeight: "600",
  },
});
