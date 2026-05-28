import { Mascot } from "@/components/Mascot";
import {
  verifyEmail,
  verifyPassword,
  verifyfirstAndSecondPassword,
} from "@/utils/authUtils";
import { postFetch } from "@/utils/fetchUtils";
import { PostalCode, searchPostalCodes } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function registerScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecondPassword, setShowSecondPassword] = useState(false);
  const [error, setError] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
  const [selectedCity, setSelectedCity] = useState<String | null>(null);
  const [selectedPostalCode, setSelectedPostalcode] = useState<String | null>(
    null,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLocationSearch = async (query: string) => {
    setCityQuery(query);
    const postalCodes = await searchPostalCodes(query);
    setPostalCodes(postalCodes);
  };

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
      router.replace("/auth/login");
    }, 3500);

    return () => clearTimeout(timer);
  }, [showSuccess]);

  const handleRegisterAccount = async () => {
    if (!verifyfirstAndSecondPassword(password, secondPassword, setError))
      return;
    if (!verifyPassword(password, setError)) return;
    if (!verifyEmail(email, setError)) return;

    try {
      const response = await postFetch("/api/auth/register", {
        email,
        name,
        password,
        city: selectedCity,
        postalCode: selectedPostalCode,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setError(
          errorData?.message ??
            "Emailen eksisterer allerede eller adgangskoden lever ikke op til kravene",
        );
        return;
      }

      setShowSuccess(true);
    } catch (error) {
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
          <Text style={styles.successTitle}>Din konto er oprettet!</Text>
          <Text style={styles.successSubtitle}>Du kan nu logge ind</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Snatch</Text>
          <Text style={styles.subtitle}>Registrer en konto</Text>

          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.linkTop}>Allerede registreret? Log ind</Text>
          </TouchableOpacity>

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

          <TextInput
            style={styles.input}
            placeholder="Navn"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCity(postal.postnummer.navn);
                    setSelectedPostalcode(postal.postnummer.nr);
                    setCityQuery(
                      `${postal.postnummer.nr} ${postal.postnummer.navn}`,
                    );
                    setPostalCodes([]);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {postal.postnummer.nr} {postal.postnummer.navn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Adgangskode"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
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

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Gentag adgangskode"
              placeholderTextColor="#aaa"
              value={secondPassword}
              onChangeText={setSecondPassword}
              secureTextEntry={!showSecondPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowSecondPassword(!showSecondPassword)}
            >
              <Ionicons
                name={showSecondPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegisterAccount}
          >
            <Text style={styles.buttonText}>Opret konto</Text>
          </TouchableOpacity>
        </>
      )}
      <Text style={styles.consentText}>
        Ved at oprette en konto accepterer du vores{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/privacy/privacy")}
        >
          privatlivspolitik
        </Text>
      </Text>
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
  consentText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  link: {
    color: "#3a7d3a",
    fontWeight: "600",
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
    borderRadius: 40,
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
  linkTop: {
    color: "#3a7d3a",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
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
});
