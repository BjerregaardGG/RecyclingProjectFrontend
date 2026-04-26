import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getFetch, postFetch } from "@/utils/fetchUtils";
import { Item } from "@/interfaces/item";
import { User } from "@/interfaces/user";
import { calculateDistance } from "@/utils/locationUtils";
import { PickupRequest } from "@/interfaces/pickupRequest";

export default function ItemScreen() {
  const { id, userId, latitude, longitude } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pickupRequest, setPickupRequest] = useState<PickupRequest | null>(
    null,
  );

  useEffect(() => {
    fetchItem();
    fetchUser();
  }, []);

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

  return (
    <ScrollView style={styles.container}>
      {/* Tilbage knap */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Billede */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Hoved sektion */}
      <View style={styles.section}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.secondDescription}>{item.secondDescription}</Text>
      </View>

      {/* Beskrivelse sektion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beskrivelse</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {/* Afhentning & Afstand sektion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Afhentningssted</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#3a7d3a" />
          <Text style={styles.locationText}>{userData.city}</Text>
        </View>

        <View style={styles.distanceAndButtonRow}>
          <View style={styles.distanceContainer}>
            <View style={locationIsPresent() ? styles.dot : styles.dotGray} />
            <Text style={styles.distance}>
              {locationIsPresent()
                ? calculateDistance(
                    Number(latitude),
                    Number(longitude),
                    item.latitude,
                    item.longitude,
                  )
                : "Ukendt afstand"}
            </Text>
          </View>
        </View>
      </View>

      {/* Sælger sektion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Udbydes af</Text>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.name?.substring(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{userData?.name}</Text>
        </View>
      </View>

      {/* Knap */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button} onPress={handlePickup}>
          <Text style={styles.buttonText}>Snatch it</Text>
        </TouchableOpacity>
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
  success: {
    color: "#3a7d3a",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
});
