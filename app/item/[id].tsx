import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getFetch, postFetch, deleteFetch } from "@/utils/fetchUtils";
import { Item } from "@/interfaces/item";
import { User } from "@/interfaces/user";
import { calculateDistance } from "@/utils/locationUtils";
import { PickupRequest } from "@/interfaces/pickupRequest";
import InfoTooltip from "@/components/InfoToolTip";
import { Mascot } from "@/components/Mascot";

export default function ItemScreen() {
  const { id, userId, latitude, longitude } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loggedInUserData, setLoggedInUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pickupRequest, setPickupRequest] = useState<PickupRequest | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      fetchItem();
      fetchUser();
      fetchLoggedInUser();
    }, []),
  );

  const locationIsPresent = (): boolean => {
    if (!item?.latitude || !item?.longitude) return false;
    if (!latitude || !longitude) return false;
    return true;
  };

  const fetchItem = async () => {
    try {
      const response = await getFetch(`/api/items/${id}`);
      const data = await response.json();
      setItem(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await getFetch(`/api/users/${userId}`);
      const data = await response.json();
      setUserData(data);
      console.log(userData);
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const fetchLoggedInUser = async () => {
    try {
      const response = await getFetch(`/api/users/me`);
      if (!response.ok) {
        setError("Kunne ikke indsamle bruger data");
      }
      const data = await response.json();
      setLoggedInUserData(data);
    } catch (e) {
      setError("Noget gik galt");
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async () => {
    try {
      const response = await postFetch(`/api/pickups/items/${id}`, {});
      if (!response.ok) {
        setError("Noget gik galt – prøv igen");
        return;
      }
      const pickupRequest = await response.json();
      setPickupRequest(pickupRequest);
      setSuccess("Du er markeret som interesseret i at afhente denne ting!");
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    try {
      const response = await deleteFetch(`/api/items/${id}`);

      if (!response.ok) {
        setError("Noget gik galt - prøv igen");
      }
      const deletedItem = await response.json();
      router.replace("/(tabs)");
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Indlæser...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text>Ingen ting fundet</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>Bruger ikke fundet</Text>
      </View>
    );
  }

  if (!loggedInUserData) {
    return (
      <View style={styles.centered}>
        <Text>Bruger ikke fundet</Text>
      </View>
    );
  }

  const renderButton = () => {
    const isOwner = item.userId === loggedInUserData.id;
    const status = item.status;

    if (isOwner && status === "AVAILABLE") {
      return (
        <TouchableOpacity style={styles.buttonDelete} onPress={deleteItem}>
          <Text style={styles.buttonText}>Slet snatch</Text>
        </TouchableOpacity>
      );
    }

    if (isOwner && status === "RESERVED") {
      return (
        <View style={styles.statusBox}>
          <Ionicons name="time-outline" size={20} color="#888" />
          <Text style={styles.statusText}>
            Reserveret — afventer afhentning
          </Text>
        </View>
      );
    }

    if (isOwner && status === "GIVEN_AWAY") {
      return (
        <View style={styles.statusBox}>
          <Ionicons name="checkmark-done-outline" size={20} color="#3a7d3a" />
          <Text style={styles.statusText}>Afhentet</Text>
        </View>
      );
    }

    if (!isOwner && status === "AVAILABLE") {
      return (
        <TouchableOpacity style={styles.button} onPress={handlePickup}>
          <Text style={styles.buttonText}>Snatch it</Text>
        </TouchableOpacity>
      );
    }

    if (!isOwner && status === "RESERVED") {
      return (
        <View style={styles.statusBox}>
          <Ionicons name="time-outline" size={20} color="#888" />
          <Text style={styles.statusText}>Allerede reserveret</Text>
        </View>
      );
    }

    return (
      <View style={styles.statusBox}>
        <Ionicons name="close-circle-outline" size={20} color="#888" />
        <Text style={styles.statusText}>Denne genstand er afhentet</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.section}>
        {error ? (
          <View style={styles.stateView}>
            <Mascot mood="happy" size={160} />
            <Text style={styles.stateText}>
              Du har allerede anmodet om at snatche denne item!
            </Text>
          </View>
        ) : null}
        {success ? (
          <View style={styles.stateView}>
            <Mascot mood="excited" size={160} />
            <Text style={styles.stateText}>Du er nu i kø til denne item!</Text>
          </View>
        ) : null}

        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.secondDescription}>{item.secondDescription}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beskrivelse</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      <View style={styles.section}>
        <InfoTooltip
          sectionTitle="Afhentningssted"
          title="Afhentningssted"
          text="Når brugeren accepterer din anmodning, så vil du automatisk få adgang til at se adressen."
        />
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#3a7d3a" />
          <Text style={styles.locationText}>{userData.city}</Text>
        </View>

        {locationIsPresent() && (
          <View style={styles.distanceAndButtonRow}>
            <View style={styles.distanceContainer}>
              <View style={styles.dot} />
              <Text style={styles.distance}>
                {calculateDistance(
                  Number(latitude),
                  Number(longitude),
                  item.latitude,
                  item.longitude,
                )}
              </Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/user/[id]",
            params: {
              id: userData.id,
            },
          });
        }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Udbydes af</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              {userData.image ? (
                <Image
                  source={{ uri: userData.image }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userData?.name?.substring(0, 1).toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={styles.userName}>{userData?.name}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.buttonSection}>{renderButton()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stateView: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 16,
  },
  stateText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
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
    marginBottom: 4,
  },
  secondDescription: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    backgroundColor: "#3a7d3a",
  },
  dotGray: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8a8a8a",
  },
  distance: {
    fontSize: 13,
    color: "#888",
  },
  description: {
    fontSize: 14,
    color: "#2c2c2c",
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: -5,
  },
  locationText: {
    fontSize: 14,
    color: "#2c2c2c",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  buttonSection: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: "#3a7d3a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonDelete: {
    backgroundColor: "#742222",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  distanceAndButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  error: {
    color: "#e24b4a",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  success: {
    color: "#3a7d3a",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
});
