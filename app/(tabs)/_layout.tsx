import {
  NotificationProvider,
  useNotifications,
} from "@/contexts/NotificationContexts";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

function TabsNavigator() {
  const { unreadCount } = useNotifications();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3a7d3a",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e0e0e0",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hjem",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="snatches"
        options={{
          title: "Snatches",
          tabBarIcon: ({ color }) => (
            <Ionicons name="hand-left-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="give"
        options={{
          title: "Giv væk",
          tabBarIcon: ({ color }) => (
            <Ionicons name="refresh-circle-outline" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Indbakke",
          tabBarIcon: ({ color }) => (
            <Ionicons name="mail-outline" size={30} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// NotificationContexts - updates the notification count for all tabs
export default function TabLayout() {
  return (
    <NotificationProvider>
      <TabsNavigator />
    </NotificationProvider>
  );
}
