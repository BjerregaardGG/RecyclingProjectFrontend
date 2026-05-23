import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Mascot } from "@/components/Mascot";

type Props = {
  message?: string;
};

export function LoadingScreen({ message = "Henter..." }: Props) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        <Mascot mood="sleeping" size={180} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f5f0",
    gap: 16,
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});
