import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { Item } from "@/interfaces/item";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { useCallback, useMemo, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { User } from "@/interfaces/user";
import { useRouter } from "expo-router";
import { SimpleLineIcons } from "@expo/vector-icons";
import { pickAndUploadImage } from "@/utils/cloudinaryUtils";
import { Mascot } from "@/components/Mascot";
import { Ionicons } from "@expo/vector-icons";
import { StarRating } from "@/components/StarRating";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;
const FILTER_OPTIONS = [
  { label: "Tilgængelige", value: "AVAILABLE" },
  { label: "Reserveret", value: "RESERVED" },
  { label: "Afhentet", value: "GIVEN_AWAY" },
  { label: "Alle", value: "all" },
];
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#888",
  RESERVED: "#e6a23c",
  GIVEN_AWAY: "#32719b",
};

type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];

export default function ProfileScreen() {
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>("AVAILABLE");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [average, setAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const currentLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label;

  useFocusEffect(
    useCallback(() => {
      fetchItems();
      fetchUserData();
    }, []),
  );

  const filteredItems = useMemo(() => {
    let result =
      filter === "all" ? items : items.filter((item) => item.status === filter);

    return [...result].sort((a, b) => {
      if (!a.reservedAt) return 1;
      if (!b.reservedAt) return -1;
      return (
        new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()
      );
    });
  }, [items, filter]);

  const handlePickImage = async () => {
    const url = await pickAndUploadImage();
    if (url) {
      uploadPicture(url);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await getFetch("/api/users/me");
      const data = await response.json();
      setUserData(data);
      fetchRating(data.id);
    } catch (e) {
      setError("Noget gik galt – prøv igen");
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getFetch("/api/items/me");
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

  const uploadPicture = async (url: string) => {
    try {
      console.log(url);
      const response = await patchFetch(
        `/api/users/me/image?image=${encodeURIComponent(url)}`,
      );

      if (!response.ok) {
        setError("Noget gik galt - prøv igen");
        return;
      }
      setUserData((prev) => (prev ? { ...prev, image: url } : prev));
    } catch (error) {
      setError("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userData?.name}</Text>
      </View>

      {/* Profile section */}
      <TouchableOpacity onPress={handlePickImage}>
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
      </TouchableOpacity>

      <View style={styles.ratings}>
        <StarRating rating={average} />
        <Text style={styles.ratingsText}>({reviewCount})</Text>
      </View>

      {/* Dropdown modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.dropdown}>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  filter === option.value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setFilter(option.value);
                  setDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    filter === option.value && styles.dropdownItemTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <View style={styles.content}>
        {/* Items */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Dine opslag ({currentLabel})</Text>
          <TouchableOpacity onPress={() => setDropdownOpen(true)}>
            <SimpleLineIcons
              style={styles.sectionOptions}
              name="options"
              size={20}
              color="#3a7d3a"
            />
          </TouchableOpacity>
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Mascot mood="sad" size={160} />
            {currentLabel === "Alle" ? (
              <Text style={styles.emptyText}>Der er ingen snatches</Text>
            ) : (
              <Text style={styles.emptyText}>
                Der er ingen {currentLabel?.charAt(0).toLowerCase()}
                {currentLabel?.slice(1)} snatches
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((item) => (
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
                {item.likeCount > 0 && (
                  <View style={styles.likeOverlay}>
                    <Ionicons name="heart" size={14} color="#727171" />
                    <Text style={styles.likeOverlayText}>{item.likeCount}</Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text
                    style={[
                      styles.cardDescription,
                      { color: STATUS_COLORS[item.status] },
                    ]}
                  >
                    {FILTER_OPTIONS.find((o) => o.value === item.status)?.label}
                  </Text>
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
    paddingBottom: 12,
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
  changeImageButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#3a7d3a",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    alignSelf: "center",
  },
  changeImageText: {
    fontSize: 12,
    color: "#3a7d3a",
    fontWeight: "500",
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
  likeOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likeOverlayText: {
    fontSize: 12,
    color: "#2c2c2c",
    fontWeight: "600",
  },
});
