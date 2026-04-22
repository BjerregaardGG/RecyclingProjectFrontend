import * as ImagePicker from "expo-image-picker";

export async function pickAndUploadImage(): Promise<string | null> {
  // Check if we have permission to upload pictures
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

  // Ask for permission if not granted
  if (status !== "granted") {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Du skal give adgang til dit fotobiblotek under indstillinger");
      return null;
    }
  }

  // Open image libary
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled) return null;

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append("file", {
    uri: result.assets[0].uri,
    type: "image/jpeg",
    name: "upload.jpg",
  } as any);
  formData.append(
    "upload_preset",
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();
  return data.secure_url;
}
