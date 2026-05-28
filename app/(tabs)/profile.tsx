import { LoadingScreen } from "@/components/LoadingScreen";
import { Mascot } from "@/components/Mascot";
import { StarRating } from "@/components/StarRating";
import { Item } from "@/interfaces/item";
import { User } from "@/interfaces/user";
import { handleLogout } from "@/utils/authUtils";
import { pickAndUploadImage } from "@/utils/cloudinaryUtils";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [items, setItems] = useState<Item[]>([]);
  const [likedItems, setLikedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>("AVAILABLE");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [average, setAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const currentLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label;

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, []),
  );

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchItems(), fetchUserData(), fetchLikedItems()]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result;
    if (filter === "liked") {
      result = likedItems;
    } else {
      result =
        filter === "all"
          ? items
          : items.filter((item) => item.status === filter);
    }

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
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setUserData(data);
      fetchRating(data.id);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getFetch("/api/items/me");
      if (!response.ok) {
        return;
      }
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

  const fetchLikedItems = async () => {
    try {
      const response = await getFetch("/api/likes/me");
      if (!response.ok) return;
      const data = await response.json();
      setLikedItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadPicture = async (url: string) => {
    try {
      const response = await patchFetch(
        `/api/users/me/image?image=${encodeURIComponent(url)}`,
        {},
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        Alert.alert(errorData?.message ?? "Kunne ikke uploade billede");
        return;
      }
      setUserData((prev) => (prev ? { ...prev, image: url } : prev));
    } catch (error) {
      Alert.alert("Noget gik galt - prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return <LoadingScreen message="Henter din profil" />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                router.push("/profile/edit");
              }}
            >
              <Ionicons name="create-outline" size={18} color="#2c2c2c" />
              <Text style={styles.menuItemText}>Rediger profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setFilter("liked");
              }}
            >
              <Ionicons name="heart" size={18} color="#2c2c2c" />
              <Text style={styles.menuItemText}>Likede opslag</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                handleLogout(router);
              }}
            >
              <Ionicons name="log-out-outline" size={18} color="#e24b4a" />
              <Text style={[styles.menuItemText, { color: "#e24b4a" }]}>
                Log ud
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.profileCard}>
        {/* profile picture */}
        <TouchableOpacity
          onPress={handlePickImage}
          style={styles.profileImageWrapper}
        >
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
        </TouchableOpacity>

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
          <Text style={styles.sectionLabel}>
            {filter === "liked"
              ? "Likede opslag"
              : `Dine opslag (${currentLabel})`}
          </Text>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 2,
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#3a7d3a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 12,
  },
  headerSpacer: {
    width: 22,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "flex-end",
    paddingTop: 88,
    paddingRight: 16,
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: "#2c2c2c",
    fontWeight: "500",
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
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
  profileImageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  profileImageSide: {
    width: "100%",
    height: "100%",
  },
  profileAvatarSide: {
    width: "100%",
    height: "100%",
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
