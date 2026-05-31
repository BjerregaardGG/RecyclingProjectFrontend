// InfoToolTip component - used for explaining location details
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  text: string;
  sectionTitle?: string;
  size?: number;
  color?: string;
};

export default function InfoTooltip({
  title,
  text,
  sectionTitle,
  size = 18,
  color = "#888",
}: Props) {
  const [visible, setVisible] = useState(false);

  const trigger = (
    <TouchableOpacity onPress={() => setVisible(true)}>
      <Ionicons name="help-circle-outline" size={size} color={color} />
    </TouchableOpacity>
  );

  return (
    <>
      {sectionTitle ? (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{sectionTitle}</Text>
          {trigger}
        </View>
      ) : (
        trigger
      )}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.content}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalText}>{text}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c2c2c",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: "#3a7d3a",
    fontWeight: "600",
    fontSize: 14,
  },
});
