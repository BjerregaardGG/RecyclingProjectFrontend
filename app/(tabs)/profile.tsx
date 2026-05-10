import { useEffect, useState } from "react";
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
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { User } from "@/interfaces/user";
import { useRouter } from "expo-router";
import { pickAndUploadImage } from "@/utils/cloudinaryUtils";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchItems();
      fetchUserData();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        setUserData(userData);
      }
    }, [userData]),
  );

  const handlePickImage = async () => {
    const url = await pickAndUploadImage();
    if (url) {
      uploadPicture(url);
    }
  };

  const fetchUserData = async () => {
    const response = await getFetch("/api/users/me");
    const data = await response.json();
    setUserData(data);
  };

  const fetchItems = async () => {
    try {
      const response = await getFetch("/api/items/me");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
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

        {/* Image upload */}
        <TouchableOpacity onPress={handlePickImage}>
          <View>
            <Text>Skift profilbillede</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Items */}
        <Text style={styles.sectionLabel}>Dine opslag ({items.length})</Text>
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
                <Text style={styles.cardDescription}>
                  {item.secondDescription}
                </Text>
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
  imageUpload: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: "#aaa",
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
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 12,
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
    marginBottom: 12,
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3a7d3a",
    marginBottom: 10,
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
});
