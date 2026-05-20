import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RatingProps = {
  rating: number;
  size?: number;
  color?: string;
};

export function StarRating({
  rating,
  size = 16,
  color = "#f5b400",
}: RatingProps) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= rating ? "star" : "star-outline"}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
}
