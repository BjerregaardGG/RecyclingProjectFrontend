# Snatch — Frontend

Frontend til **Snatch**, en mobilapp hvor brugere kan give brugte genstande væk til folk i nærområdet i stedet for at smide dem ud. Bygget som hovedopgave på datamatikeruddannelsen.

Dette repository indeholder mobilappen. Backend findes i et separat repo.

## Indhold

- [Funktionalitet](#funktionalitet)
- [Teknologier](#teknologier)
- [Kom i gang](#kom-i-gang)
- [Arkitektur](#arkitektur)
- [State management](#state-management)
- [Navigation](#navigation)
- [WebSocket-chat](#websocket-chat)
- [Linting](#linting)

## Funktionalitet

Appen understøtter et komplet bytte-flow:

- **Login og registrering** med email og adgangskode
- **Glemt adgangskode** via email-reset
- **Browse items** i nærområdet, sorteret efter afstand
- **Filtrér** efter kategori og søgeord
- **Like** items som favoritter
- **Opret eget opslag** med billede, beskrivelse, lokation og kategori
- **Anmod om afhentning** ("Snatch it")
- **Acceptér / afvis** indgående anmodninger
- **Live chat** mellem giver og modtager via WebSocket
- **Marker som afhentet** (gensidig bekræftelse)
- **Anmeld** den anden bruger efter afhentning
- **Notifikationer** med live-opdatering
- **Profil** med statistik, items og anmeldelser

## Teknologier

| Område     | Valg                                           |
| ---------- | ---------------------------------------------- |
| Sprog      | TypeScript                                     |
| Framework  | React Native + Expo SDK 54                     |
| Navigation | Expo Router (file-based routing)               |
| State      | React Context + lokal useState                 |
| Storage    | AsyncStorage (til JWT-token)                   |
| HTTP       | Fetch API (custom wrapper med token-injection) |
| WebSocket  | STOMP via @stomp/stompjs + SockJS              |
| Lokation   | expo-location                                  |
| Billeder   | expo-image-picker + Cloudinary                 |
| Linting    | ESLint med react-native-plugin                 |
| CI         | GitHub Actions                                 |

## Kom i gang

### Forudsætninger

- Node.js 20+
- npm eller yarn
- Expo Go-appen på din telefon (iOS eller Android)
- Backend kørende (se backend-repoets README)

### Setup

1. **Klon repoet**

   ```bash
   git clone <https://github.com/BjerregaardGG/RecyclingProjectFrontend>
   cd snatch-frontend
   ```

2. **Installér afhængigheder**

   ```bash
   npm install
   ```

3. **Opret `.env`-fil** i roden:

   ```
   EXPO_PUBLIC_API_URL=https://din-ngrok-url.ngrok-free.dev
   EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=<dit-cloudinary-navn>
   EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<dit-upload-preset>
   ```

   Backend-URL skal være offentligt tilgængelig (fx via ngrok) hvis du tester på en fysisk telefon, da telefonen ikke kan se din computers `localhost`.

4. **Start Expo**

   ```bash
   npx expo start
   ```

5. **Åbn appen** ved at scanne QR-koden med Expo Go-appen på din telefon.

   Hvis telefon og computer ikke er på samme wifi, brug tunnel-mode:

   ```bash
   npx expo start --tunnel
   ```

## Arkitektur

Appen bygger på et par centrale mønstre:

### Lagdeling

```
Skærm (UI)  →  Hook / Context  →  Fetch util  →  Backend
```

- **Skærme** håndterer kun UI og brugerinteraktion
- **Hooks og context** håndterer logik der skal deles
- **Backend** står for forretningslogik og persistens

### Komponentopdeling

Genbrugelige UI-elementer ligger i `components/` (mascot, stjerner, loading-skærm). Komponenterne er holdt simple og uden forretningslogik — de viser bare det de får ind via props.

## State management

Appen bruger tre niveauer af state:

**1. Lokal komponent-state (`useState`)**

Bruges til det meste — formular-input, loading-flags, fejlbeskeder, midlertidig UI-state.

**2. React Context (`NotificationProvider`)**

Bruges til notifikationer, der skal vises mange steder (header-badge, inbox-liste). Polling hvert 30. sekund + `AppState`-lytter sikrer at notifikationer er opdaterede uden at hver komponent skal hente dem selv.

**3. AsyncStorage**

Bruges til at persistere JWT-tokenen mellem app-sessioner, så brugeren ikke skal logge ind hver gang.

## Navigation

Appen bruger **Expo Router** — file-based navigation hvor filer i `app/`-mappen bliver til routes:

- `app/(tabs)/index.tsx` → `/` (bottom-tab "Hjem")
- `app/item/[id].tsx` → `/item/123` (dynamisk parameter)
- `app/reviews/[userId].tsx` → `/reviews/42`

`(tabs)` med parenteser betyder en "route group" der ikke optræder i URL'en — den definerer bare en fælles bottom-tab-navigation for alle filer inde i.

## WebSocket-chat

Chat-funktionaliteten bruger STOMP over WebSocket for live beskeder.

`useChat`-hooken håndterer alt logik:

1. **Henter chathistorik** via HTTP ved opstart
2. **Markerer beskeder som læst** via PATCH
3. **Åbner WebSocket-forbindelse** med JWT-token som query-parameter
4. **Subscriber** til `/topic/chat/{pickupId}`
5. **Publisher** beskeder til `/app/chat/{pickupId}` når brugeren sender
6. **Lukker forbindelsen** automatisk når brugeren forlader skærmen

Mønstret: HTTP til engangs-data (historik), WebSocket til live-data (nye beskeder).

## Geolokation

Appen beder om lokationsadgang for at:

- Sortere items efter afstand fra brugeren
- Vise "Under 1 km væk", "3.5 km væk" osv.

Hvis brugeren afslår, vises items uden afstand — alt funktionalitet virker stadig.

## Linting

### Linting

ESLint køres med `eslint-config-expo` plus `eslint-plugin-react-native` for at fange ubrugte styles og inline-styles:

```bash
npm run lint
```

### TypeScript

Type-tjek køres som del af CI:

```bash
npx tsc --noEmit
```

## Designvalg

Et par valg der gjorde appen mere brugervenlig:

- **Mascot** — en lille figur der reagerer på tilstand (glad, trist, begejstret), bruges i empty states, success-skærme og fejl
- **Lagdelt fejlhåndtering**:
  - Field-niveau (under input): klientside-validering
  - Form-niveau (rød boks over knap): backend-fejl ved bruger-handlinger
  - Skærm-niveau (full screen mascot): 404, 403
  - Silent rollback: optimistiske handlinger som likes
- **Persistent status** — efter en handling som "Snatch it" vises "Du er i kø" konsistent, både umiddelbart efter klik og når brugeren senere vender tilbage
- **Diskret hjælpetekst** under kritiske knapper (fx "Marker som afhentet") så brugeren forstår konsekvensen uden at skulle trykke på et info-ikon

## Forfatter

Oliver Bjerregaard
Lavet som hovedopgave på datamatikeruddannelsen, foråret 2026.
