// This is the forgot password page (email verification)
import { Mascot } from "@/components/Mascot";
import { verifyEmail } from "@/utils/authUtils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
      router.replace("/auth/login");
    }, 3500);

    return () => clearTimeout(timer);
  }, [showSuccess]);

  const handleForgotPassword = async () => {
    if (!verifyEmail(email, setError)) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/forgot-password?email=${email}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.message ?? "Email-adressen er ikke gyldig");
        return;
      }

      setShowSuccess(true);
      setError("");
    } catch (error) {
      console.log(error);
      setError("Noget gik galt – prøv igen");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Tilbage</Text>
      </TouchableOpacity>

      {showSuccess ? (
        <View style={styles.successScreen}>
          <Mascot mood="excited" size={200} />
          <Text style={styles.successTitle}>Email sendt!</Text>
          <Text style={styles.successSubtitle}>
            Vi har sendt dig et link til at nulstille dit password
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.sadState}>
            <Mascot mood="sad" size={160} />
          </View>
          <Text style={styles.title}>Glemt password?</Text>
          <Text style={styles.subtitle}>
            Indtast din email så sender vi dig et link
          </Text>

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

          <TouchableOpacity
            style={styles.button}
            onPress={handleForgotPassword}
          >
            <Text style={styles.buttonText}>Send link</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
  sadState: {
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
});
