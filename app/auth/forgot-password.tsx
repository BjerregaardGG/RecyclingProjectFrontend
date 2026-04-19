import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { verifyEmail } from "@/utils/passwordUtils";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleForgotPassword = async () => {
    if (!verifyEmail(email, setError)) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/forgot-password?email=${email}`,
        {
          method: "POST",
        },
      );

      console.log("Status:", response.status);

      if (!response.ok) {
        console.log("Catch fejl:", error);
        setError("Noget gik galt – prøv igen");
        return;
      }

      setSuccess(
        "Vi har sendt dig en email med et link til at nulstille dit password",
      );
      setError("");
    } catch (error) {
      console.log("Catch fejl:", error);
      setError("Noget gik galt – prøv igen");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Tilbage</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Glemt password?</Text>
      <Text style={styles.subtitle}>
        Indtast din email så sender vi dig et link
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Send link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f5f0",
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  backText: {
    color: "#3a7d3a",
    fontSize: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#3a7d3a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
    marginTop: 8,
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
