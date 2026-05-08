// app/chat/[pickupId].tsx
import { useState, useRef, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChat } from "@/hooks/useChat";
import { Message } from "@/interfaces/message";
import { User } from "@/interfaces/user";
import { formatRelativeTime } from "@/utils/dateUtils";
import { getFetch } from "@/utils/fetchUtils";

export default function ChatScreen() {
  const { pickupId, otherName, otherImage } = useLocalSearchParams<{
    pickupId: string;
    otherName?: string;
    otherImage: string;
  }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { messages, connected, loading, sendMessage } = useChat(
    pickupId ? Number(pickupId) : null,
  );
  const [text, setText] = useState("");
  const [userData, setUserData] = useState<User | null>(null);

  // Scroll to the bottom when recieveing new messages
  useEffect(() => {
    fetchUser();
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText("");
  };

  const fetchUser = async () => {
    try {
      const response = await getFetch("/api/users/me");

      if (!response.ok) {
        console.log(console.error);
      }
      const userData = await response.json();
      setUserData(userData);
    } catch (e) {
    } finally {
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === userData?.id;
    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowOther,
        ]}
      >
        {!isMine && <Avatar uri={otherImage} name={otherName} />}

        <View
          style={[
            styles.messageBubble,
            isMine ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.messageTextMine : styles.messageTextOther,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMine ? styles.messageTimeMine : styles.messageTimeOther,
            ]}
          >
            {formatRelativeTime(item.sentAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{otherName ?? "Chat"}</Text>
          <Text style={styles.headerStatus}>
            {connected ? "Online" : "Forbinder..."}
          </Text>
        </View>
      </View>

      {/* Beskeder */}
      {loading ? (
        <View style={styles.centered}>
          <Text>Indlæser...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="chatbubbles-outline" size={48} color="#aaa" />
          <Text style={styles.emptyText}>Skriv den første besked!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Skriv en besked..."
          placeholderTextColor="#aaa"
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function Avatar({ uri, name }: { uri?: string; name?: string }) {
  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} resizeMode="cover" />;
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarFallbackText}>
        {name?.substring(0, 1).toUpperCase() ?? "?"}
      </Text>
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
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  headerStatus: {
    fontSize: 11,
    color: "#c8e6c9",
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
  list: {
    padding: 16,
    gap: 8,
  },
  messageRow: {
    flexDirection: "row",
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: "#3a7d3a",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMine: {
    color: "#fff",
  },
  messageTextOther: {
    color: "#2c2c2c",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 2,
  },
  messageTimeMine: {
    color: "#c8e6c9",
    textAlign: "right",
  },
  messageTimeOther: {
    color: "#aaa",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#2c2c2c",
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3a7d3a",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#aaa",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
    marginTop: 12,
    marginRight: 8
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2e7d32",
  },
});
