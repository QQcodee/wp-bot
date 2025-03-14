import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3001"; // Replace with your backend URL

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [campaignStatus, setCampaignStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);

    newSocket.on("connect", () => console.log("Connected to socket server"));

    // Listen to backend events
    newSocket.on("campaigns", (data) => {
      console.log("Campaigns received:", data);
      setCampaigns(data);
    });

    newSocket.on("campaignsStatus", (status) => {
      console.log("Campaign status:", status);
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign.id === status.campaignId
            ? {
                ...campaign,
                status: status.status,
              }
            : campaign
        )
      );
      setCampaignStatus(status);
    });

    newSocket.on("campaignsProgress", (data) => {
      console.log("Campaign progress updated:", data);
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign.id === data.campaignId
            ? {
                ...campaign,
                progress: data.progress,
                current: data.current,
                lastPhone: data.lastPhone,
              }
            : campaign
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return {
    socket,
    campaigns,
    sessionStatus,
    campaignStatus,
    progress,
    message,
  };
};

/*

 newSocket.on("sessionConnected", (data) => {
      console.log("Session connected:", data);
      setSessionStatus({ status: "connected", account: data });
    });

    newSocket.on("sessionDisconnected", (data) => {
      console.log("Session disconnected:", data);
      setSessionStatus({ status: "disconnected", account: data });
    });

     newSocket.on("message-sent", (data) => {
      console.log("Message sent:", data);
      setMessage(data);
    });


    */
