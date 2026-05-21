import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // To save the Web token
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Mascot } from "@/components/Mascot";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        setError("Forkert email eller adgangskode");
        return;
      }

      const data = await response.json();
      await AsyncStorage.setItem("token", data.token);
      router.replace("/(tabs)");
    } catch (error) {
      setError("Noget gik galt – prøv igen");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.happyState}>
        <Mascot mood="happy" size={160} />
      </View>
      <Text style={styles.title}>Snatch</Text>
      <Text style={styles.subtitle}>Log ind på din konto</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Adgangskode"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log ind</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text style={styles.link}>Har du ikke en konto? Opret dig her</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
        <Text style={styles.link}>Glemt adgangskode?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  happyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "500",
    color: "#3a7d3a",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: "#2c2c2c",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#3a7d3a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  link: {
    color: "#3a7d3a",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  error: {
    color: "#e24b4a",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    marginBottom: 12,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#2c2c2c",
  },
  eyeButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
