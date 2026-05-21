import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getFetch(endpoint: string): Promise<Response> {
  const token = await AsyncStorage.getItem("token");

  return await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
}

export async function postFetch(endpoint: string, body: {}): Promise<Response> {
  const token = await AsyncStorage.getItem("token");

  return await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });
}

export async function patchFetch(
  endpoint: string,
  body: {},
): Promise<Response> {
  const token = await AsyncStorage.getItem("token");

  return await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });
}

export async function deleteFetch(endpoint: string): Promise<Response> {
  const token = await AsyncStorage.getItem("token");

  return await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
}
