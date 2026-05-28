import { Message } from "@/interfaces/message";
import { getFetch, patchFetch } from "@/utils/fetchUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client, IMessage as StompMessage } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import "text-encoding";

export function useChat(pickupId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!pickupId) return;

    // we set it to active when the component is monuted
    let isActive = true;

    const setup = async () => {
      try {
        const response = await getFetch(`/api/messages/pickup/${pickupId}`);
        if (response.ok) {
          const history = await response.json();
          if (isActive) setMessages(history);
        }
      } catch (error) {
        console.error("Could not load chat history:", error);
      } finally {
        if (isActive) setLoading(false);
      }

      try {
        await patchFetch(`/api/messages/pickup/${pickupId}/mark-as-read`, {});
      } catch (error) {
        console.error("Could not mark as read:", error);
      }

      // Create web socket connection
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const wsUrl = `${process.env.EXPO_PUBLIC_API_URL}/ws?token=${encodeURIComponent(token)}`;

      console.log("Connecting to:", wsUrl);

      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 5000,

        onConnect: () => {
          console.log("WS Connected!");
          if (!isActive) return;
          setConnected(true);

          // Connects the client to the chat
          client.subscribe(`/topic/chat/${pickupId}`, (msg: StompMessage) => {
            const newMessage: Message = JSON.parse(msg.body);
            setMessages((prev) => [...prev, newMessage]);
          });
        },

        beforeConnect: () => {
          console.log("STOMP: Before connect");
        },

        onWebSocketClose: (event) => {
          console.log("WS Closed:", event.code, event.reason);
        },

        onWebSocketError: (event) => {
          console.log("WS Error:", event);
        },

        debug: (str) => {
          console.log("STOMP:", str);
        },

        onDisconnect: () => {
          if (isActive) setConnected(false);
        },

        onStompError: (frame) => {
          console.error("STOMP error:", frame.headers["message"]);
        },
      });

      client.activate();
      clientRef.current = client;
    };

    setup();

    // if the component is unmounted -> we deactivate the webSocket connection
    return () => {
      isActive = false;
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [pickupId]);

  const sendMessage = (content: string) => {
    if (!clientRef.current || !connected || !pickupId) return;

    clientRef.current.publish({
      destination: `/app/chat/${pickupId}`,
      body: JSON.stringify({ content }),
    });
  };

  return { messages, connected, loading, sendMessage };
}
