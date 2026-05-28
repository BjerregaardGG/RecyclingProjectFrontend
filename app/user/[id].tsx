import { LoadingScreen } from "@/components/LoadingScreen";
import { Mascot } from "@/components/Mascot";
import { StarRating } from "@/components/StarRating";
import { Item } from "@/interfaces/item";
import { User } from "@/interfaces/user";
import { getFetch } from "@/utils/fetchUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [average, setAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, []),
  );

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchItems(), fetchUserData()]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await getFetch(`/api/users/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setUserData(data);
      fetchRating(data.id);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getFetch(`/api/items/user/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.log(error);
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
      console.log(e);
    }
  };

  if (loading) {
    return <LoadingScreen message="Henter bruger" />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileCard}>
        {/* Billede */}
        {userData?.image ? (
          <Image
            source={{ uri: userData.image }}
            style={styles.profileImageSide}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.profileAvatarSide}>
            <Text style={styles.profileAvatarTextSide}>
              {userData?.name?.substring(0, 1).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileNameRow}>
            <Text style={styles.profileName}>{userData?.name}</Text>
            {reviewCount > 0 && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="star" size={10} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.profileRatingRow}>
            <StarRating rating={average} size={13} />
            <Text style={styles.profileMetaText}>({reviewCount})</Text>
          </View>

          {userData?.city && (
            <View style={styles.profileLocationRow}>
              <Ionicons name="location-outline" size={12} color="#888" />
              <Text style={styles.profileLocationText}>{userData.city}</Text>
            </View>
          )}

          {userData?.profileText && (
            <Text style={styles.profileBio} numberOfLines={3}>
              {userData.profileText}
            </Text>
          )}
        </View>
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
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  header: {
    backgroundColor: "#3a7d3a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backButton: {
    width: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 24,
  },
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
  profileCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    padding: 14,
  },
  profileImageSide: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileAvatarSide: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarTextSide: {
    fontSize: 42,
    fontWeight: "500",
    color: "#2e7d32",
  },
  profileInfo: {
    flex: 1,
    gap: 6,
    paddingTop: 4,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f1f1f",
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  profileMetaText: {
    fontSize: 11,
    color: "#888",
    fontWeight: "500",
  },
  profileLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  profileLocationText: {
    fontSize: 12,
    color: "#888",
  },
  profileBio: {
    fontSize: 12,
    color: "#555",
    lineHeight: 16,
    marginTop: 4,
  },
  content: {
    padding: 16,
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
});
