"use client";
import { PlusCircleIcon, Trash, Upload } from "lucide-react";
import React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatISO, set } from "date-fns";

import Papa from "papaparse"; // Import PapaParse for CSV parsing
import { ToastContainer, toast } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";

import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

import TiptapEditor from "@/components/TipTap";

import supabase from "@/config/supabaseClient";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/hooks/use-socket";

const API_BASE = "http://localhost:3001";

const Home = () => {
  const { campaigns, sessionStatus, campaignStatus, progress, message } =
    useSocket();
  //console.log("Campaigns:", campaigns);

  const [currentCampaign, setCurrentCampaign] = useState({
    batchSize: 50,
    timeout: 120,
    randomDelay: [10000, 15000],
    account: "default",
    template: "",
    contacts: [],
    datetime: new Date(),
    imageUrl: "",
  });
  //console.log("Current campaign:", currentCampaign);

  const [batchSize, setBatchSize] = useState(2);
  const [timeout, setTimeout] = useState(30);
  const [randomDelay, setRandomDelay] = useState([10000, 15000]);
  const [template, setTemplate] = useState();
  const [contacts, setContacts] = useState([]);

  const [datetime, setDatetime] = useState(new Date());

  const [imageUrl, setImageUrl] = useState("");

  const [contactsTable, setContactsTable] = useState([]);

  const [socketStatus, setSocketStatus] = useState(false);

  useEffect(() => {
    setTemplate(currentCampaign.template);
    setContacts(currentCampaign.contacts);
    setContactsTable(currentCampaign.contacts);
    setDatetime(
      currentCampaign.scheduleTime
        ? new Date(currentCampaign.scheduleTime) // Ensure we use the correct key
        : null // Use null instead of "" to clear the DatePicker properly
    );

    setImageUrl(currentCampaign.imageUrl);
    setBatchSize(currentCampaign.batchSize);
    setTimeout(currentCampaign.timeout);
    setRandomDelay(currentCampaign.randomDelay);
  }, [currentCampaign]);

  useEffect(() => {
    if (campaigns.length > 0) {
      setCurrentCampaign(campaigns[0]);
    }
  }, [campaigns]);

  const [loader, setLoader] = useState(0);

  useEffect(() => {
    setLoader(0); // Reset loader when message changes

    if (
      !currentCampaign?.randomDelay ||
      currentCampaign.randomDelay.length < 2
    ) {
      return;
    }

    const maxDelay = currentCampaign.randomDelay[0]; // Get max value from [min, max]
    const interval = 100; // Update every 100ms
    const totalSteps = maxDelay / interval; // Number of steps required
    const increment = 100 / totalSteps; // Percentage increment per step

    let progress = 0;
    const timer = setInterval(() => {
      progress += increment;
      setLoader(Math.min(progress, 100)); // Ensure it never exceeds 100%

      if (progress >= 100) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer); // Cleanup on unmount or message change
  }, [message, currentCampaign]);

  const messages = [
    {
      sender: "John Doe",
      message: "Hola, ¿cómo estás?",
      time: "10:30 AM",
      isUser: false,
      image: null,
    },
    {
      sender: "You",
      message: template || "👈👈Escribe te mensaje para ver como se ve",
      time: "10:32 AM",
      isUser: true,
      image: imageUrl || null,
    },
    {
      sender: "John Doe",
      message: "Mas info!",
      time: "10:35 AM",
      isUser: false,
      image: null,
    },
  ];

  const handleChange = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date selected:", date);
      return;
    }

    // Get local timezone offset as a string (e.g., "-06:00")
    const offsetMinutes = date.getTimezoneOffset();
    const sign = offsetMinutes > 0 ? "-" : "+";
    const hours = String(Math.abs(offsetMinutes / 60)).padStart(2, "0");
    const minutes = String(Math.abs(offsetMinutes % 60)).padStart(2, "0");
    const timezoneOffset = `${sign}${hours}:${minutes}`;

    // Convert date to local ISO format with timezone offset
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hoursLocal = String(date.getHours()).padStart(2, "0");
    const minutesLocal = String(date.getMinutes()).padStart(2, "0");

    const localISO = `${year}-${month}-${day}T${hoursLocal}:${minutesLocal}${timezoneOffset}`;

    setDatetime(localISO); // Save formatted date
  };

  const buildJson = () => {
    return {
      batchSize,
      timeout,
      randomDelay,
      template,
      contacts,
      datetime,
      imageUrl,
    };
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data;

          // Check headers
          const headers = data[0]; // Assuming the first row contains headers
          if (
            !headers ||
            headers[0].toLowerCase() !== "name" ||
            headers[1].toLowerCase() !== "phone"
          ) {
            toast.error(
              "El archivo CSV debe tener las columnas 'name' y 'phone' en la primera fila."
            );
            return;
          }

          // Validate rows
          const invalidRows = [];
          const parsedContacts = data
            .slice(1) // Skip headers
            .filter((row) => row[0] && row[1]) // Ensure both name and phone are not empty
            .map((row, index) => {
              const phone = row[1].trim();
              if (!/^\d{13}$/.test(phone)) {
                invalidRows.push(index + 2); // Collect row numbers of invalid rows
                return null; // Mark invalid rows
              }
              return {
                name: row[0].trim(), // Trim name
                phone, // Trim phone (already done above)
              };
            })
            .filter(Boolean); // Remove any invalid rows (nulls)

          if (parsedContacts.length === 0) {
            toast.error("No valid rows found in the CSV file.");
            return;
          }

          if (invalidRows.length > 0) {
            toast.error(`${invalidRows.length} contactos no son validos`);
          }

          setContacts(parsedContacts);
          setContactsTable(
            parsedContacts.map((contact) => ({ ...contact, sent: false }))
          );

          toast.success("Lista de contactos cargada!");
        },
        header: false, // assuming no header row in the CSV file
      });
    }
  };

  const sendJson = async () => {
    const jsonData = buildJson();
    try {
      const response = await fetch(
        "http://localhost:3001/schedule-campaign/dental_reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonData),
        }
      );
      const result = await response.json();
      console.log("Response:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleSelectChange = (event) => {
    const selectedId = event.target.value;
    const selectedCampaign = campaigns.find((c) => c.id === selectedId);
    setCurrentCampaign(selectedCampaign);
  };

  return (
    <div className="w-screen h-screen max-h-screen p-5 flex flex-col overflow-hidden">
      {/* Header with fixed height */}
      <div className="h-16 w-full flex items-center gap-5 justify-between">
        <div className="flex gap-5 items-center">
          <h1 className="m-0">Campañas</h1>
          {campaigns.length > 0 ? (
            <select
              onChange={handleSelectChange}
              value={currentCampaign?.id || ""}
            >
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.account} - {campaign.id}
                </option>
              ))}
            </select>
          ) : (
            <p>No campaigns available</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`bg-${socketStatus ? "red" : "green"}-500 hover:bg-${
              socketStatus ? "red" : "green"
            }-700 text-white font-bold py-2 px-4 rounded`}
            onClick={() => setSocketStatus(!socketStatus)}
          >
            {socketStatus ? "Apagar Socket" : "Encender Socket"}
          </button>
        </div>
      </div>

      {/* Grid should take remaining space */}
      <div className="w-full flex-1 grid grid-cols-3 gap-5 overflow-hidden">
        {/* First Column */}
        <div className="max-h-screen overflow-auto">
          <div className="w-full h-full p-4">
            <div className="flex flex-col w-full h-full bg-white border rounded-lg shadow-lg py-4 px-4 justify-between max-h-screen overflow-auto">
              <div className="flex w-full flex-col gap-2">
                <label className="w-full">Template Message</label>
                <Textarea
                  id="template"
                  placeholder="Mensaje"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full h-32"
                />
              </div>
              <div className="flex-1 flex flex-col justify-end items-center overflow-auto">
                <div className="p-4 space-y-4 flex flex-col items-center w-full">
                  <div className="flex w-full flex-col gap-2">
                    <label className="w-full" htmlFor="batch-size">
                      Account
                    </label>
                    <div className="flex items-center w-full gap-2">
                      <select
                        id="account-select"
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="account1">Account 1</option>
                        <option value="account2">Account 2</option>
                      </select>
                      <PlusCircleIcon className="w-6 h-6 cursor-pointer" />{" "}
                    </div>
                  </div>
                  <div className="flex items-center w-full gap-4">
                    <div className="flex w-full flex-col gap-2">
                      <label className="w-full" htmlFor="batch-size">
                        Batch Size
                      </label>
                      <Input
                        id="batch-size"
                        type="number"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <label className="w-full" htmlFor="timeout">
                        Timeout
                      </label>
                      <Input
                        id="timeout"
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeout(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-center">
                    <label className="w-full" htmlFor="random-delay">
                      Random Delay
                    </label>
                    <Input
                      id="random-delay"
                      type="text"
                      placeholder="comma separated"
                      value={randomDelay.join(",")}
                      onChange={(e) =>
                        setRandomDelay(e.target.value.split(",").map(Number))
                      }
                    />
                  </div>

                  <div className="flex w-full flex-col gap-2">
                    <label className="w-full" htmlFor="random-delay">
                      Date and Time
                    </label>
                    <DatePicker
                      selected={datetime ? new Date(datetime) : null}
                      onChange={handleChange}
                      showTimeSelect
                      dateFormat="Pp"
                      timeIntervals={1}
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <label className="w-full" htmlFor="image-url">
                      Image URL
                    </label>
                    <Input
                      id="image-url"
                      type="text"
                      placeholder="Image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  disabled={
                    template === "" ||
                    batchSize === 0 ||
                    timeout === 0 ||
                    !randomDelay ||
                    datetime === null
                  }
                  className={`w-full font-bold text-[19px] mt-4 text-white ${
                    template === "" ||
                    batchSize === 0 ||
                    timeout === 0 ||
                    !randomDelay ||
                    datetime === null
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300"
                  } font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                  onClick={sendJson}
                >
                  Programar Campaña
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Column (Chat Section) */}
        <div className="h-full flex flex-col overflow-hidden">
          {/* Chat Section (3/4 height) */}
          <div className="w-full flex-1 max-h-[75vh] flex flex-col p-4 overflow-hidden">
            <div className="flex flex-col h-full w-full bg-white border rounded-lg shadow-lg">
              {/* Header */}
              <div className="flex items-center p-4 border-b">
                <div className="w-10 h-10 bg-green-500 rounded-full"></div>
                <div className="ml-3">
                  <h2 className="font-semibold text-lg">Consultorio Dental</h2>
                  <p className="text-sm text-gray-500">En Línea</p>
                </div>
              </div>

              {/* Messages (Fix Overflow) */}
              <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg flex flex-col border ${
                        msg.isUser
                          ? "bg-green-100 text-green-900"
                          : "bg-gray-100 text-gray-900"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Attached"
                          className="mt-2 rounded-lg mb-2"
                        />
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs text-gray-500 w-full text-right">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input Section (1/4 height) */}
          <div className="w-full flex-shrink-0 h-[25vh] p-4">
            <div className="flex flex-col h-full w-full bg-white border rounded-lg shadow-lg p-4 justify-between gap-2">
              <div className="flex flex-col gap-2">
                <h2 className="text-center">
                  Enviando mensajes desde
                  {"   "}({currentCampaign?.account})
                </h2>
                <button className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 w-1/2 mx-auto">
                  Detener Envios
                </button>
                <hr className="w-full border-gray-300 my-2" />

                <Progress value={loader} color="blue" />
                <div className="w-full h-[15px] flex items-center justify-center">
                  <p className="text-sm text-gray-500">
                    {message ? `Mensaje enviado a ${message.phone}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <hr className="w-full border-gray-300 my-2" />
                <Progress value={progress?.progress * 100 || 0} color="green" />
                <div className="w-full h-[15px] flex items-center justify-center">
                  <p className="text-sm text-gray-500">
                    {progress
                      ? `${progress?.current}/${contacts.length}`
                      : "No hay ninguna campaña activa"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Column (Contacts Table) */}
        <div className="h-full overflow-hidden">
          <div className="w-full h-full flex flex-col p-4">
            <div className="flex flex-col h-full gap-4 w-full bg-white border rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">
                  Contactos {contacts.length > 0 && `(${contacts.length})`}
                </p>
                <Trash
                  onClick={() => {
                    setContacts([]);
                    setContactsTable([]);
                    (
                      document.getElementById("file-upload") as HTMLInputElement
                    ).value = "";
                  }}
                  className="w-5 h-5"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center cursor-pointer bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  style={{ display: "none" }}
                />
              </div>

              <div className="w-full h-full overflow-y-auto">
                <table className="w-full h-full overflow-y-auto">
                  <thead className="bg-gray-100 text-gray-600 text-left rounded-t">
                    <tr>
                      <th className="py-2 px-4">Nombre</th>
                      <th className="py-2 px-4">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactsTable.map((contact, index) => (
                      <tr
                        key={index}
                        className={contact.sent ? "bg-green-100" : ""}
                        style={{ border: "1px solid #ddd" }}
                      >
                        <td style={{ padding: "8px" }}>{contact.name}</td>
                        <td style={{ padding: "8px" }}>{contact.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
