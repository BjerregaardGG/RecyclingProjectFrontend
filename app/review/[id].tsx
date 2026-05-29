// This is the 'give review' page, which the user can enter once the request is successfull
import { Mascot } from "@/components/Mascot";
import { postFetch } from "@/utils/fetchUtils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReviewScreen() {
  const { pickupId } = useLocalSearchParams<{ pickupId: string }>();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Vælg venligst en rating");
      return;
    }
    setSubmitting(true);

    try {
      const response = await postFetch("/api/reviews", {
        pickupId: Number(pickupId),
        rating,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        Alert.alert(errorData?.message ?? "Kunne ikke sende anmeldelse");
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (e) {
      console.log(e);
      Alert.alert("Noget gik galt – prøv igen");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successScreen}>
        <Mascot mood="excited" size={200} />
        <Text style={styles.successTitle}>Tak for din anmeldelse!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giv en anmeldelse</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Hvordan var oplevelsen?</Text>
        <Text style={styles.subtitle}>Vælg antal stjerner</Text>

        {/* Stjerner */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setRating(n)}
              style={styles.starButton}
            >
              <Ionicons
                name={n <= rating ? "star" : "star-outline"}
                size={48}
                color="#f5b400"
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (rating === 0 || submitting) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Sender..." : "Send anmeldelse"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2c2c2c",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  stars: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  button: {
    backgroundColor: "#3a7d3a",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 220,
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
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f5f0",
    paddingHorizontal: 32,
    gap: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#3a7d3a",
    textAlign: "center",
  },
});
