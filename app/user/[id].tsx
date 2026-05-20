import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Item } from "@/interfaces/item";
import { getFetch } from "@/utils/fetchUtils";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { User } from "@/interfaces/user";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Mascot } from "@/components/Mascot";
import { StarRating } from "@/components/StarRating";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [average, setAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
      fetchUserData();
    }, []),
  );

  const fetchUserData = async () => {
    try {
      const response = await getFetch(`/api/users/${id}`);
      if (!response.ok) {
        setError("Problemer med at indsamle brugerdata");
      }
      const data = await response.json();
      setUserData(data);
      fetchRating(data.id);
    } catch (e) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getFetch(`/api/items/user/${id}`);
      const data = await response.json();
      setItems(data);
      console.log(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const fetchRating = async (userId: number) => {
    try {
      const response = await getFetch(`/api/reviews/user/${userId}/average`);
      if (!response.ok) return;
      const data = await response.json();
      setAverage(data.averageRating);
      setReviewCount(data.totalReviews);
    } catch (e) {
      setError("Noget gik galt - prøv igen");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userData?.name}</Text>
      </View>

      {/* Profil sektion */}
      <View style={styles.profileSection}>
        {userData?.image ? (
          <Image
            source={{ uri: userData.image }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {userData?.name?.substring(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ratings}>
        <StarRating rating={average} />
        <Text style={styles.ratingsText}>({reviewCount})</Text>
      </View>

      <View style={styles.content}>
        {/* Items */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Opslag ({items.length})</Text>
        </View>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Mascot mood="sad" size={160} />
            <Text style={styles.emptyText}>Der er ingen åbne snatches</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/item/[id]",
                    params: {
                      id: item.id,
                      userId: item.userId,
                    },
                  })
                }
              >
                <Image style={styles.cardImage} source={{ uri: item.image }} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardDescription}></Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
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
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  header: {
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 2,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileAvatarText: {
    fontSize: 42,
    fontWeight: "500",
    color: "#2e7d32",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "500",
    color: "#2c2c2c",
  },
  ratings: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
    marginRight: 8,
    alignSelf: "center",
  },
  ratingsText: {
    marginTop: 4,
    color: "#3a7d3a",
    alignSelf: "center",
  },
  content: {
    padding: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "flex-end",
    paddingTop: 318,
    paddingRight: 16,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: "#f0f7f0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#2c2c2c",
  },
  dropdownItemTextActive: {
    color: "#3a7d3a",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3a7d3a",
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionOptions: {
    marginRight: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  cardImage: {
    width: "100%",
    height: 170,
  },
  cardBody: {
    padding: 8,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2c2c2c",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 9,
    fontWeight: "500",
    color: "#2c2c2c",
    marginBottom: 2,
  },
});
