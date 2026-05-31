// This is the 'review overview' page, which can be entered from profile or the user page
import { LoadingScreen } from "@/components/LoadingScreen";
import { Mascot } from "@/components/Mascot";
import { StarRating } from "@/components/StarRating";
import { Review } from "@/interfaces/review";
import { User } from "@/interfaces/user";
import { formatRelativeTime } from "@/utils/dateUtils";
import { getFetch } from "@/utils/fetchUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UserRating = {
  averageRating: number;
  totalReviews: number;
};

export default function ReviewsScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<UserRating>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loggedInUserData, setLoggedInUserData] = useState<User | null>(null);
  const [reviewedUser, setReviewedUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, []),
  );

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReviews(),
        fetchRating(),
        fetchLoggedInUser(),
        fetchReviewedUser(),
      ]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await getFetch(`/api/reviews/user/${userId}`);
      if (!response.ok) return;
      const data = await response.json();
      setReviews(data);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchRating = async () => {
    try {
      const response = await getFetch(`/api/reviews/user/${userId}/average`);
      if (!response.ok) return;
      const data = await response.json();
      setRating(data);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchLoggedInUser = async () => {
    try {
      const response = await getFetch(`/api/users/me`);
      if (!response.ok) return;
      const data = await response.json();
      setLoggedInUserData(data);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchReviewedUser = async () => {
    try {
      const response = await getFetch(`/api/users/${userId}`);
      if (!response.ok) return;
      const data = await response.json();
      setReviewedUser(data);
    } catch (e) {
      console.log(e);
    }
  };

  if (loading) {
    return <LoadingScreen message="Henter anmeldelser" />;
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
        <Text style={styles.headerTitle}>Anmeldelser</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Review stats and image */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <View style={styles.summaryAvatar}>
            {reviewedUser?.image ? (
              <Image
                source={{ uri: reviewedUser.image }}
                style={styles.summaryAvatarImage}
              />
            ) : (
              <Text style={styles.summaryAvatarText}>
                {reviewedUser?.name?.substring(0, 1).toUpperCase()}
              </Text>
            )}
          </View>

          <Text style={styles.averageNumber}>
            {rating.averageRating.toFixed(1)}
          </Text>
          <StarRating rating={rating.averageRating} size={20} />
          <Text style={styles.totalText}>
            {rating.totalReviews}{" "}
            {rating.totalReviews === 1 ? "anmeldelse" : "anmeldelser"}
          </Text>
        </View>

        {/* All reviews */}
        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Mascot mood="sad" size={160} />
            <Text style={styles.emptyText}>Ingen anmeldelser endnu</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {reviews.map((review) => (
              <TouchableOpacity
                key={review.id}
                style={styles.reviewCard}
                onPress={() => {
                  if (loggedInUserData?.id === review.reviewerId) {
                    router.push("/(tabs)/profile");
                  } else {
                    router.push({
                      pathname: "/user/[id]",
                      params: { id: review.reviewerId.toString() },
                    });
                  }
                }}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}>
                    {review.reviewerImage ? (
                      <Image
                        source={{ uri: review.reviewerImage }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {review.reviewerName.substring(0, 1).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewerName}>
                      {review.reviewerName}
                    </Text>
                    <StarRating rating={review.rating} size={13} />
                  </View>

                  <Text style={styles.reviewDate}>
                    {formatRelativeTime(review.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#3a7d3a",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  summaryAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 6,
  },
  summaryAvatarImage: {
    width: "100%",
    height: "100%",
  },
  summaryAvatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  averageNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2c2c2c",
  },
  totalText: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  list: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewInfo: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c2c2c",
  },
  reviewDate: {
    fontSize: 11,
    color: "#999",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
  },
});
