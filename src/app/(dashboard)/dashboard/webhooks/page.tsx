"use client";

import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import { Phone, Plus } from "lucide-react";

import {
  DOMKeyframesDefinition,
  AnimationOptions,
  ElementOrSelector,
  useAnimate,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import WaveAnimation from "./_components/WaveAnimation";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { io } from "socket.io-client";

const page = () => {
  const [testAccount, setTestAccount] = React.useState("dental_reviews");
  const [webhookUrl, setWebhookUrl] = React.useState("");

  const [sockets, setSockets] = React.useState([]);

  const [url, setURL] = React.useState("http://localhost:3001");

  useEffect(() => {
    if (!url) return;
    const socket = io(url);
    socket.on("connect", () => {
      console.log("Connected to the server");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });

    socket.on("sockets", (data) => {
      console.log("Sockets:", data);
      setSockets(data);
    });
  }, []);

  const createNewSocket = async () => {
    try {
      const response = await axios.post(`${url}/start/${testAccount}`, {
        webhookUrl: webhookUrl,
      });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  const stopSocket = async () => {
    try {
      const response = await axios.post(`${url}/stop/${testAccount}`, {});
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-y-auto px-5 pb-5">
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <div className="flex items-center justify-between space-x-2">
        <h1 className="inline-flex gap-2 font-rubik text-4xl font-bold">
          Webhooks
        </h1>

        <Dialog>
          <DialogTrigger className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-white">
            <Plus />
            Crear Webhook
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Web Hook</DialogTitle>
              <Input
                type="url"
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://www.google.com"
              />
            </DialogHeader>
            <Button variant={"ghost"} onClick={createNewSocket}>
              Crear Webhook
            </Button>

            <Button variant={"destructive"} onClick={stopSocket}>
              Stop Socket
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-4 border-gray-200 pb-10">
        {sockets?.map((socket) => (
          <WebhookCard
            key={socket}
            status={"active"}
            phone={socket?.socket?.id}
            onClick={stopSocket}
            webhook={socket?.webhookUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default page;

const WebhookCard = ({
  status: status = "error",
  onClick = () => {},
  phone,
  webhook,
}: {
  status: "active" | "error";
  onClick?: () => void;
  phone?: string;
  webhook?: string;
}) => {
  return (
    <div
      className={cn(
        "flex h-[180px] w-full flex-col justify-between gap-3 rounded border bg-stone-100/40 p-4",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-bold">
          WebHook {status === "active" ? "Activo" : "Fallo"}
        </p>
        <Button onClick={onClick} variant={"destructive"}>
          Desactivar Webhook
        </Button>
      </div>

      <div className="flex h-full w-full items-center justify-between gap-5">
        <div className="flex w-full items-center">
          <div className="flex items-center gap-2">
            <Phone />
            <span className="whitespace-nowrap"> +{phone?.slice(0, 13)}</span>
          </div>
        </div>

        <div className="overflow-hidden whitespace-nowrap">{webhook} </div>
      </div>
    </div>
  );
};

//<WaveAnimation status={status} />
