import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { pickAndUploadImage } from "@/utils/cloudinaryUtils";
import { postFetch } from "@/utils/fetchUtils";
import { Category } from "@/interfaces/category";
import { useEffect } from "react";
import { getFetch } from "@/utils/fetchUtils";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getFetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    }
  };

  const handlePickImage = async () => {
    const url = await pickAndUploadImage();
    if (url) setImage(url);
  };

  const handleUpload = async () => {
    if (!name) {
      setError("Venligst udfyld navnet på din genstand");
      return;
    }
    if (!description) {
      setError("Venligst giv din wastey en beskrivelse");
      return;
    }
    if (!selectedCategory) {
      setError("Venligst giv din wastey en kategori");
      return;
    }

    setLoading(true);
    try {
      const response = await postFetch("/api/items", {
        name,
        description,
        secondTitle,
        categoryId: selectedCategory.id,
        image,
      });

      if (!response.ok) {
        setError("Noget gik galt – prøv igen");
        return;
      }

      setSuccess("Din ting er uploaded!");
      setName("");
      setDescription("");
      setImage(null);
      setSelectedCategory(null);
      setError("");
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
                <Text style={styles.imagePlaceholderText}>Tilføj billede</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Navn */}
          <Text style={styles.label}>Titel</Text>
          <TextInput
            style={styles.input}
            placeholder="Hvad vil du give væk?"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          {/* Second description */}
          <Text style={styles.label}>Undertitel</Text>
          <TextInput
            style={styles.input}
            placeholder="Giv din genstand en undertitel"
            placeholderTextColor="#aaa"
            value={secondTitle}
            onChangeText={setSecondTitle}
          />

          {/* Description */}
          <Text style={styles.label}>Beskrivelse</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Beskrivelse"
            placeholderTextColor="#aaa"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Category */}
          <Text style={styles.label}>Kategori</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  header: {
    backgroundColor: "#3a7d3a",
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  content: {
    padding: 16,
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
    height: 100,
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
});
