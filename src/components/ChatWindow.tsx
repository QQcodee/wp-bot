"use client";
import { useEffect, useState } from "react";
import supabase from "@/config/supabaseClient";

const ChatWindow = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("n8n_chat_histories")
        .select("message")
        .eq("session_id", sessionId)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        const parsedMessages = data.map((row) => row.message);
        setMessages(parsedMessages);
      }

      setLoading(false);
    };

    fetchChats();
  }, [sessionId]);

  if (loading) return <div>Loading chats...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-3 overflow-auto p-4 pb-20">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.type === "human" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] rounded-xl p-3 shadow-md ${
              msg.type === "human"
                ? "bg-blue-100 text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
