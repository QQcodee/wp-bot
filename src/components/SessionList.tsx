"use client";

import { useEffect, useState } from "react";
import supabase from "@/config/supabaseClient";

const SessionList = ({ onSelect }) => {
  const [current, setCurrent] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("n8n_chat_histories")
        .select("session_id")
        .order("session_id", { ascending: true });

      if (error) {
        console.error("Error fetching sessions:", error);
      } else {
        const unique = [...new Set(data.map((row) => row.session_id))];
        setSessions(unique);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="h-screen w-80 overflow-y-auto border-r border-gray-300 bg-white">
      <div className="border-b bg-gray-100 px-4 py-2 text-lg font-bold">
        Chats
      </div>
      <ul className="divide-y">
        {sessions.map((id, idx) => (
          <li
            key={idx}
            className={`cursor-pointer px-4 py-3 transition hover:bg-gray-100 ${current === id ? "bg-gray-200" : ""}`}
            onClick={() => {
              onSelect?.(id);
              setCurrent(id);
            }}
          >
            <div className="truncate text-sm font-medium text-gray-800">
              {id}
            </div>
            <div className="text-xs text-gray-500">Session ID</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;
