// This is the privacy policy page
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#eee" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privatlivspolitik</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.lastUpdated}>Senest opdateret: maj 2026</Text>

        <Text style={styles.intro}>
          Hos Snatch tager vi dit privatliv alvorligt. Denne politik forklarer,
          hvilke oplysninger vi indsamler, hvordan vi bruger dem, og hvilke
          rettigheder du har.
        </Text>

        <Section title="1. Hvilke oplysninger vi indsamler">
          <Text style={styles.paragraph}>
            Når du opretter en konto og bruger Snatch, indsamler vi følgende:
          </Text>
          <Bullet text="Kontooplysninger: dit navn, din emailadresse og din adgangskode (adgangskoden gemmes krypteret)." />
          <Bullet text="Lokationsoplysninger: din by og dit postnummer, samt adressen på de genstande du giver væk." />
          <Bullet text="Billeder: profilbilleder og billeder af de genstande du opretter." />
          <Bullet text="Beskeder: indholdet af de beskeder du sender til andre brugere i forbindelse med en afhentning." />
          <Bullet text="Aktivitet: dine opslag, anmodninger, likes og anmeldelser." />
        </Section>

        <Section title="2. Hvordan vi bruger dine oplysninger">
          <Text style={styles.paragraph}>
            Vi bruger dine oplysninger til at:
          </Text>
          <Bullet text="Drive appens funktioner, herunder at vise genstande i nærheden af dig." />
          <Bullet text="Muliggøre kontakt og koordinering mellem giver og modtager." />
          <Bullet text="Vise anmeldelser og vurderinger, så brugere kan have tillid til hinanden." />
          <Bullet text="Sende dig notifikationer om anmodninger, beskeder og afhentninger." />
        </Section>

        <Section title="3. Deling af oplysninger">
          <Text style={styles.paragraph}>
            Visse oplysninger er synlige for andre brugere som en naturlig del
            af appens funktion: dit navn, dit profilbillede, din by, dine opslag
            og dine anmeldelser.
          </Text>
          <Text style={styles.paragraph}>
            Den præcise afhentningsadresse vises først for en bruger, når du
            accepterer deres anmodning om en genstand.
          </Text>
          <Text style={styles.paragraph}>
            Vi sælger ikke dine personoplysninger til tredjeparter.
          </Text>
        </Section>

        <Section title="4. Opbevaring af data">
          <Text style={styles.paragraph}>
            Vi opbevarer dine oplysninger, så længe du har en aktiv konto. Hvis
            du sletter din konto, fjernes dine personoplysninger inden for
            rimelig tid, medmindre vi er retligt forpligtet til at opbevare dem
            længere.
          </Text>
        </Section>

        <Section title="5. Dine rettigheder">
          <Text style={styles.paragraph}>
            Efter databeskyttelsesforordningen (GDPR) har du ret til at:
          </Text>
          <Bullet text="Få indsigt i, hvilke oplysninger vi har om dig." />
          <Bullet text="Få rettet forkerte oplysninger." />
          <Bullet text="Få slettet dine oplysninger ('retten til at blive glemt')." />
          <Bullet text="Trække dit samtykke tilbage." />
          <Text style={styles.paragraph}>
            Du kan udøve disse rettigheder ved at kontakte os via oplysningerne
            nedenfor.
          </Text>
        </Section>

        <Section title="6. Sikkerhed">
          <Text style={styles.paragraph}>
            Vi beskytter dine oplysninger med passende tekniske
            foranstaltninger, herunder kryptering af adgangskoder. Ingen
            overførsel af data over internettet er dog fuldstændig sikker, og vi
            kan derfor ikke garantere absolut sikkerhed.
          </Text>
        </Section>

        <Section title="7. Ændringer i denne politik">
          <Text style={styles.paragraph}>
            Vi kan opdatere denne privatlivspolitik fra tid til anden.
            Væsentlige ændringer vil blive meddelt i appen.
          </Text>
        </Section>

        <Section title="8. Kontakt">
          <Text style={styles.paragraph}>
            Har du spørgsmål til denne politik eller til behandlingen af dine
            oplysninger, kan du kontakte os på:
          </Text>
          <Text style={styles.contact}>olbj0001@stud.kea.dk</Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
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
    color: "#eee",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 48,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#999",
    marginBottom: 16,
  },
  intro: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c2c2c",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#3a7d3a",
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
  },
  contact: {
    fontSize: 14,
    color: "#3a7d3a",
    fontWeight: "600",
    marginTop: 4,
  },
});
