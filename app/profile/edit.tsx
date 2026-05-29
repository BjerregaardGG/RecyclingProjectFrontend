// This is the edit profile page
import { LoadingScreen } from "@/components/LoadingScreen";
import { User } from "@/interfaces/user";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import { PostalCode, searchPostalCodes } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [profileText, setProfileText] = useState("");

  const [cityQuery, setCityQuery] = useState("");
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPostalCode, setSelectedPostalCode] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await getFetch("/api/users/me");
      if (!response.ok) return;
      const data: User = await response.json();
      setName(data.name ?? "");
      setProfileText(data.profileText ?? "");

      if (data.city) {
        setSelectedCity(data.city);
        setCityQuery(data.city);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (query: string) => {
    setCityQuery(query);

    // If the user changes the field we reset what's been chosen earlier
    if (selectedCity) {
      setSelectedCity(null);
      setSelectedPostalCode(null);
    }

    if (query.trim().length < 2) {
      setPostalCodes([]);
      return;
    }

    const results = await searchPostalCodes(query);
    setPostalCodes(results);
  };

  const handleSelectPostalCode = (postal: PostalCode) => {
    setSelectedCity(postal.postnummer.navn);
    setSelectedPostalCode(postal.postnummer.nr);
    setCityQuery(`${postal.postnummer.nr} ${postal.postnummer.navn}`);
    setPostalCodes([]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Du skal udfylde dit navn");
      return;
    }

    if (cityQuery.trim() && !selectedCity) {
      setError("Du skal vælge en by fra listen");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await patchFetch("/api/users/me", {
        name: name.trim(),
        city: selectedCity ?? "",
        profileText: profileText.trim(),
        postalCode: selectedPostalCode,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        Alert.alert(errorData?.message ?? "Kunne ikke godkende ændringerne");
        return;
      }

      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert("Noget gik galt – prøv igen");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Henter anmodning" />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rediger profil</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Navn */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Navn <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Dit navn"
              placeholderTextColor="#aaa"
              maxLength={50}
            />
          </View>

          {/* By / postnummer */}
          <View style={styles.field}>
            <Text style={styles.label}>
              By <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Søg efter by eller postnummer"
              placeholderTextColor="#aaa"
              value={cityQuery}
              onChangeText={handleLocationSearch}
            />

            {postalCodes.length > 0 && (
              <View style={styles.dropdown}>
                {postalCodes.map((postal, index) => (
                  <TouchableOpacity
                    key={`${postal.postnummer.nr}-${index}`}
                    style={[
                      styles.dropdownItem,
                      index === postalCodes.length - 1 &&
                        styles.dropdownItemLast,
                    ]}
                    onPress={() => handleSelectPostalCode(postal)}
                  >
                    <Text style={styles.dropdownText}>
                      {postal.postnummer.nr} {postal.postnummer.navn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.label}>Om dig</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profileText}
              onChangeText={setProfileText}
              placeholder="Fortæl lidt om dig selv..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={3}
              maxLength={100}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{profileText.length}/100</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (saving || !name.trim()) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving || !name.trim()}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Gemmer..." : "Gem ændringer"}
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
  content: {
    padding: 16,
  },
  error: {
    color: "#e24b4a",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3a7d3a",
    marginBottom: 6,
    marginLeft: 4,
  },
  required: {
    color: "#e24b4a",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2c2c2c",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "right",
    marginTop: 4,
    marginRight: 4,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    marginTop: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: 13,
    color: "#2c2c2c",
  },
  saveButton: {
    backgroundColor: "#3a7d3a",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: "#aaa",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
