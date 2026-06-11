// This is the front page tab
import { LoadingScreen } from "@/components/LoadingScreen";
import { Mascot } from "@/components/Mascot";
import { useNotifications } from "@/contexts/NotificationContexts";
import { Category } from "@/interfaces/category";
import { Item } from "@/interfaces/item";
import { deleteFetch, getFetch, postFetch } from "@/utils/fetchUtils";
import {
  calculateDistance,
  getDistanceColor,
  getDistanceInKm,
} from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationAccess, setLocationAccess] = useState(false);
  const { unreadCount } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, []),
  );

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchItems(),
        getUserLocation(),
        fetchCategories(),
        fetchUserName(),
      ]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== "Alle") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter items based on user search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    // Filter items based on user location
    if (userLocation) {
      result = [...result].sort((a, b) => {
        if (!a.latitude || !a.longitude) return 1;
        if (!b.latitude || !b.longitude) return -1;

        const distA = getDistanceInKm(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude,
        );
        const distB = getDistanceInKm(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude,
        );

        return distA - distB;
      });
    }

    return result;
  }, [selectedCategory, searchQuery, items, userLocation]);

  const getUserLocation = async () => {
    const hasAccess = await getUserAccess();
    if (!hasAccess) {
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  // Used in getUSerLocation()
  const getUserAccess = async (): Promise<boolean> => {
    const { status: existingStatus } =
      await Location.getForegroundPermissionsAsync();

    if (existingStatus === "granted") {
      setLocationAccess(true);
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationAccess(false);
      alert(
        "Snatch skal bruge din lokation for at kunne vise hvor langt genstande er fra dig. Du kan ændre dette i dine indstillinger.",
      );
      return false;
    }
    setLocationAccess(true);
    return true;
  };

  const fetchUserName = async () => {
    try {
      const response = await getFetch("/api/users/me");
      if (!response.ok) return;

      const data = await response.json();
      setName(data.name);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getFetch("/api/items");
      if (!response.ok) return;
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getFetch("/api/categories");
      if (!response.ok) return;
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (item: Item) => {
    const newLiked = !item.isLikedByCurrentUser;
    const delta = newLiked ? 1 : -1;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isLikedByCurrentUser: newLiked,
              likeCount: i.likeCount + delta,
            }
          : i,
      ),
    );

    const rollback = () => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                isLikedByCurrentUser: item.isLikedByCurrentUser,
                likeCount: item.likeCount,
              }
            : i,
        ),
      );
    };

    try {
      const response = newLiked
        ? await postFetch(`/api/likes/like/${item.id}`, {})
        : await deleteFetch(`/api/likes/unlike/${item.id}`);

      if (!response.ok) {
        rollback();
      }
    } catch (e) {
      console.log(e);
      rollback();
    }
  };

  if (loading) {
    return <LoadingScreen message="Henter snatches i dit nærområde" />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/*Header*/}
      <View style={styles.header}>
        <View style={{ width: 26 }} />
        <Text style={styles.headerTitle}>Snatch</Text>
        <TouchableOpacity onPress={() => router.navigate("/inbox")}>
          <Ionicons
            name={unreadCount > 0 ? "notifications" : "notifications-outline"}
            size={26}
            color={unreadCount > 0 ? "#fff" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/*Search field*/}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={16} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Søg..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        {/*Welcome section*/}
        <Text style={styles.greeting}>
          Hej, <Text style={styles.greetingName}>{name}</Text> Hvad leder du
          efter i dag?
        </Text>

        <Text style={styles.sectionLabel}>Kategorier</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategory === "Alle" && styles.pillActive,
            ]}
            onPress={() => setSelectedCategory("Alle")}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === "Alle" && styles.pillTextActive,
              ]}
            >
              Alle
            </Text>
          </TouchableOpacity>

          {/*Category section*/}
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.pill,
                selectedCategory === category.categoryName && styles.pillActive,
              ]}
              onPress={() => setSelectedCategory(category.categoryName)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedCategory === category.categoryName &&
                    styles.pillTextActive,
                ]}
              >
                {category.categoryName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Items */}
        <Text style={styles.sectionLabel}>
          Snatches i dit nærområde ({filteredItems.length})
        </Text>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Mascot mood="sad" size={160} />
            <Text style={styles.emptyText}>
              Kunne ikke finde snatches i dit nærområde
            </Text>
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
                      latitude: userLocation?.latitude,
                      longitude: userLocation?.longitude,
                    },
                  })
                }
              >
                <Image
                  style={styles.cardImage}
                  source={{
                    uri: item.image,
                  }}
                />
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleLike(item);
                  }}
                >
                  <Ionicons
                    name={item.isLikedByCurrentUser ? "heart" : "heart-outline"}
                    size={20}
                    color={item.isLikedByCurrentUser ? "#e24b4a" : "#fff"}
                  />
                  {item.likeCount > 0 && (
                    <Text style={styles.likeCount}>{item.likeCount}</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardDescription}>
                    {item.secondDescription}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            locationAccess &&
                            userLocation &&
                            item.latitude &&
                            item.longitude
                              ? getDistanceColor(
                                  getDistanceInKm(
                                    userLocation.latitude,
                                    userLocation.longitude,
                                    item.latitude,
                                    item.longitude,
                                  ),
                                )
                              : "#8a8a8a",
                        },
                      ]}
                    />
                    <Text style={styles.cardDistance}>
                      {userLocation && item.latitude && item.longitude
                        ? calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            item.latitude,
                            item.longitude,
                          )
                        : ""}
                    </Text>
                  </View>
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
  header: {
    backgroundColor: "#3a7d3a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  searchWrapper: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#2c2c2c",
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  greeting: {
    fontSize: 13,
    color: "#555",
    marginBottom: 16,
  },
  greetingName: {
    color: "#3a7d3a",
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3a7d3a",
    marginBottom: 10,
  },
  categories: {
    marginBottom: 16,
  },
  pill: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#3a7d3a",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: "#3a7d3a",
  },
  pillText: {
    fontSize: 12,
    color: "#3a7d3a",
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#fff",
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
    fontWeight: "200",
    color: "#2c2c2c",
    marginBottom: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3a7d3a",
  },
  cardDistance: {
    fontSize: 11,
    color: "#888",
  },
});
