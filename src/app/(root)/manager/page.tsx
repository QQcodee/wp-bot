"use client";
import React, { useState, useEffect } from "react";

import axios from "axios";
import io from "socket.io-client";

// Connect to Socket.io server
const socket = io("http://localhost:3001"); // Backend server URL
const API_BASE = "http://localhost:3001";

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    account: "dental_reviews",
    batchSize: 5,
    timeout: 5,
    randomDelay: [1000, 3000],
    template: "Hello {name}, check our latest offer!",
    contacts: [
      { name: "John", phone: "1234567890" },
      { name: "Jane", phone: "0987654321" },
    ],
    imageUrl: "",
    datetime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
  });
  const [status, setStatus] = useState("");

  // Fetch campaigns from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE}/status`);
        setCampaigns(response);
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };
    socket.on("campaigns", (data) => {
      console.log("Campaigns data received:", data);
      setCampaigns(data); // Set the current campaigns list
    });

    fetchStatus();

    return () => {
      socket.off("campaigns"); // Clean up the event listener on component unmount
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3001/schedule-campaign/${newCampaign.account}`,
        newCampaign
      );
      setStatus(response.data.message);
    } catch (error) {
      setStatus(error.response?.data?.error || "Error scheduling campaign");
    }
  };

  const handleStopCampaign = async (campaignId) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/stop-campaign/${campaignId}`
      );
      setStatus(response.data.message);
    } catch (error) {
      setStatus(error.response?.data?.error || "Error stopping campaign");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        WhatsApp Campaigns
      </h1>

      <div className="w-full max-w-3xl mb-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Current Campaigns</h2>
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign.campaignId}
              className="border-b py-4 last:border-b-0 mb-4"
            >
              <p className="font-medium">
                <strong>Campaign ID: </strong>
                {campaign.campaignId}
              </p>
              <p>
                <strong>Status: </strong>
                {campaign.status}
              </p>
              <p>
                <strong>Progress: </strong>
                {campaign.progress}%
              </p>
              <button
                onClick={() => handleStopCampaign(campaign.campaignId)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Stop Campaign
              </button>
            </div>
          ))
        ) : (
          <p>No active campaigns</p>
        )}
      </div>

      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Schedule a New Campaign</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Batch Size:</label>
            <input
              type="number"
              value={newCampaign.batchSize}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, batchSize: e.target.value })
              }
              className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Timeout (seconds):
            </label>
            <input
              type="number"
              value={newCampaign.timeout}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, timeout: e.target.value })
              }
              className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">
              Random Delay (ms) [Min, Max]:
            </label>
            <div className="mt-2 flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={newCampaign.randomDelay[0]}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    randomDelay: [
                      parseInt(e.target.value, 10),
                      newCampaign.randomDelay[1],
                    ],
                  })
                }
                className="p-2 w-full border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Max"
                value={newCampaign.randomDelay[1]}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    randomDelay: [
                      newCampaign.randomDelay[0],
                      parseInt(e.target.value, 10),
                    ],
                  })
                }
                className="p-2 w-full border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Template Message:
            </label>
            <textarea
              value={newCampaign.template}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, template: e.target.value })
              }
              className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Image URL:</label>
            <input
              type="text"
              value={newCampaign.imageUrl}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, imageUrl: e.target.value })
              }
              className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Contacts (Name, Phone):
            </label>
            <textarea
              value={newCampaign.contacts
                .map(
                  (contact) =>
                    `  { name: "${contact.name}", phone: "${contact.phone}" }`
                )
                .join(",\n")}
              onChange={(e) => {
                const contacts = e.target.value
                  .replace(/^\s+|\s+$/g, "")
                  .split(",")
                  .map((line) => {
                    const [name, phone] = line
                      .replace(/^\s+|\s+$/g, "")
                      .split(":")
                      .map((s) => s.trim());
                    return { name: name.replace(/"/g, ""), phone };
                  })
                  .filter((c) => c.name && c.phone);
                setNewCampaign({ ...newCampaign, contacts });
              }}
              className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Schedule Date & Time:
            </label>
            <input
              type="datetime-local"
              value={newCampaign.datetime}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, datetime: e.target.value })
              }
              className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Schedule Campaign
          </button>
        </form>
        {status && <p className="mt-4 text-lg text-green-600">{status}</p>}
      </div>
    </div>
  );
}

export default App;
