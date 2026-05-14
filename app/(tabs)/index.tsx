import { useState } from "react";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Mascot } from "@/components/Mascot";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Item } from "@/interfaces/item";
import { Category } from "@/interfaces/category";
import { getFetch } from "@/utils/fetchUtils";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { calculateDistance } from "@/utils/locationUtils";
import { useMemo } from "react";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [range, setRange] = useState(5);
  const [name, setName] = useState("");
  const [initial, setInitial] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationAccess, setLocationAccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getUserLocation();
      fetchItems();
      fetchCategories();
      fetchUserName();
    }, []),
  );

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== "Alle") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [selectedCategory, searchQuery, items]);

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
    const response = await getFetch("/api/users/me");
    const data = await response.json();
    setName(data.name);
    setInitial(data.name.substring(0, 1).toUpperCase());
  };

  const fetchItems = async () => {
    try {
      const response = await getFetch("/api/items");
      const data = await response.json();
      setItems(data);
      console.log(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getFetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/*Header*/}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Snatch</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
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
        {/*Welcome*/}
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
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardDescription}>
                    {item.secondDescription}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View
                      style={locationAccess ? styles.dot : styles.dotGray}
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#2e7d32",
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
  rangeWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3a7d3a",
  },
  rangeValue: {
    fontSize: 12,
    color: "#3a7d3a",
    fontWeight: "500",
  },
  track: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 20,
  },
  trackFill: {
    height: "100%",
    backgroundColor: "#3a7d3a",
    borderRadius: 4,
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3a7d3a",
  },
  dotGray: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8a8a8a",
  },
  cardDistance: {
    fontSize: 11,
    color: "#888",
  },
});
