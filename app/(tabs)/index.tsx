import { use, useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState(5);
  const [name, setName] = useState("Oliver");
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Token hentet:", token);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/items`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.log("Catch fejl:", error);
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/categories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.log("Catch fejl:", error);
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
        <Text style={styles.headerTitle}>WASTEY</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MK</Text>
        </View>
      </View>

      {/*Search field*/}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={16} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Søg..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
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

        {/* Range slider */}
        <View style={styles.rangeWrapper}>
          <Text style={styles.rangeLabel}>Din rækkevidde</Text>
          <Text style={styles.rangeValue}>{range} km</Text>
        </View>
        <View style={styles.track}>
          <View
            style={[styles.trackFill, { width: `${(range / 20) * 100}%` }]}
          />
        </View>

        {/* Items */}
        <Text style={styles.sectionLabel}>Wastes i dit nærområde</Text>
        <View style={styles.grid}>
          {items.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <View style={[styles.cardImage]}></View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.dot} />
                  <Text style={styles.cardDistance}>2km</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    height: 100,
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
  cardDistance: {
    fontSize: 11,
    color: "#888",
  },
});
