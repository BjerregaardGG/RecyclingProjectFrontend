import { Mascot } from "@/components/Mascot";
import { Category } from "@/interfaces/category";
import { pickAndUploadImage } from "@/utils/cloudinaryUtils";
import { getFetch, postFetch } from "@/utils/fetchUtils";
import { Address, searchAdresses } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function GiveScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [secondTitle, setSecondTitle] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addreessQuery, setAddressQuery] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, []),
  );

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
      router.replace("/(tabs)");
    }, 3500);

    return () => clearTimeout(timer);
  }, [showSuccess]);

  const handleLocationSearch = async (query: string) => {
    setAddressQuery(query);
    const addresses = await searchAdresses(query);
    setAddresses(addresses);
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

  const handlePickImage = async () => {
    const url = await pickAndUploadImage();
    if (url) setImage(url);
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Venligst upload et billede af din snatch");
      return;
    }
    if (!name) {
      Alert.alert("Venligst giv din snatch et navn");
      return;
    }
    if (!secondTitle) {
      Alert.alert("Venligst giv din snatch en undertitel");
      return;
    }
    if (!description) {
      Alert.alert("Venligst giv din snatch en beskrivelse");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Venligst giv din snatch en kategori");
      return;
    }
    if (!addreessQuery) {
      Alert.alert("Venligst oplys et afhentningssted");
      return;
    }

    setLoading(true);

    const newItem = {
      name: name,
      description: description,
      secondTitle: secondTitle,
      categoryId: selectedCategory.id,
      image: image,
      address:
        selectedAddress?.adresse.vejnavn + " " + selectedAddress?.adresse.husnr,
      city: selectedAddress?.adresse.postnrnavn,
      latitude: selectedAddress?.adresse.y,
      longitude: selectedAddress?.adresse.x,
    };

    try {
      const response = await postFetch("/api/items", newItem);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        Alert.alert(
          errorData?.message ??
            "Kunne ikke uploade din snatch. Tjek om alle felter er opgivet.",
        );
        return;
      }

      setName("");
      setDescription("");
      setImage(null);
      setSelectedCategory(null);
      setSecondTitle("");
      setSelectedAddress(null);
      setAddressQuery("");
      setAddresses([]);
      setError("");

      setShowSuccess(true);
    } catch (error) {
      Alert.alert("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {showSuccess ? (
        <View style={styles.successScreen}>
          <Mascot mood="excited" size={200} />
          <Text style={styles.successTitle}>Din snatch er uploaded!</Text>
          <Text style={styles.successSubtitle}>
            Tak fordi du giver dine ting videre
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Giv en ting væk</Text>
          </View>

          <View style={styles.content}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            {/* Image upload */}
            <TouchableOpacity
              style={styles.imageUpload}
              onPress={handlePickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color="#aaa" />
                  <Text style={styles.imagePlaceholderText}>
                    Tilføj billede
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Navn */}
            <Text style={styles.label}>
              Titel <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Hvad vil du give væk?"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />

            {/* Second Title */}
            <Text style={styles.label}>
              Undertitel <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Giv din genstand en undertitel"
              placeholderTextColor="#aaa"
              value={secondTitle}
              onChangeText={setSecondTitle}
            />

            {/* Description */}
            <Text style={styles.label}>
              Beskrivelse <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Beskrivelse"
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {/* Address */}
            <Text style={styles.label}>
              Afhentningssted <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Begynd at skrive adressen..."
              placeholderTextColor="#aaa"
              value={addreessQuery}
              onChangeText={handleLocationSearch}
            />

            {addresses.length > 0 && (
              <View style={styles.dropdown}>
                {addresses.map((address, index) => (
                  <TouchableOpacity
                    key={`${address.adresse.id}-${index}`}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedAddress(address);
                      (setAddressQuery(address.tekst), setAddresses([]));
                    }}
                  >
                    <Text style={styles.dropdownText}>{address.tekst}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Category */}
            <Text style={styles.label}>
              Kategori <Text style={styles.required}>*</Text>
            </Text>
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
                    selectedCategory?.id === category.id && styles.pillActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedCategory?.id === category.id &&
                        styles.pillTextActive,
                    ]}
                  >
                    {category.categoryName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Upload button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleUpload}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Uploader..." : "Giv væk"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f5f0",
    paddingHorizontal: 32,
    gap: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#3a7d3a",
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  header: {
    backgroundColor: "#3a7d3a",
    paddingTop: 64,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  content: {
    padding: 16,
  },
  imageUpload: {
    width: "100%",
    height: 190,
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
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#2c2c2c",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    marginBottom: 16,
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
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
  button: {
    backgroundColor: "#3a7d3a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
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
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    marginTop: -12,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  dropdownText: {
    fontSize: 13,
    color: "#2c2c2c",
  },
  required: {
    color: "#e24b4a",
  },
});
