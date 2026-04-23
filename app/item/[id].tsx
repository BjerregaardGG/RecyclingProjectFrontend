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

export default function ItemScreen() {
  const { id, userId } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [userData, setUserData] = useState()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchItem();
  }, []);

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
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async () => {
    try {
      const response = await postFetch(`/api/items/${id}/pickup`, {});
      if (!response.ok) {
        setError("Noget gik galt – prøv igen");
        return;
      }
      setSuccess("Du er markeret som interesseret i at afhente denne ting!");
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

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text>Ingen ting fundet</Text>
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

      <View style={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        {/* Navn og kategori */}
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
        </View>

        {/* Undertitel */}
        <Text style={styles.secondDescription}>{item.secondDescription}</Text>

        {/* Beskrivelse */}
        <Text style={styles.descriptionLabel}>Beskrivelse</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Afstand */}
        <View style={styles.distanceRow}>
          <View style={styles.dot} />
          <Text style={styles.distance}>2 km væk</Text>
        </View>

        {/* Afhent knap */}
        <TouchableOpacity style={styles.button} onPress={handlePickup}>
          <Text style={styles.buttonText}>Jeg vil gerne afhente denne</Text>
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
  content: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "500",
    color: "#2c2c2c",
  },
  categoryBadge: {
    backgroundColor: "#c8e6c9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    color: "#2e7d32",
    fontWeight: "500",
  },
  secondDescription: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#2c2c2c",
    lineHeight: 22,
    marginBottom: 16,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3a7d3a",
  },
  distance: {
    fontSize: 13,
    color: "#888",
  },
  button: {
    backgroundColor: "#3a7d3a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
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
