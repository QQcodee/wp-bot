"use client";
import ChatWindow from "@/components/ChatWindow";
import SessionList from "@/components/SessionList";
import React from "react";
import { useState } from "react";

const page = () => {
  const [sessionID, setSessionID] = useState("");
  return (
    <div className="flex h-screen">
      <SessionList onSelect={setSessionID} />
      <ChatWindow sessionId={sessionID} />
    </div>
  );
};

export default page;
