"use client";

import React from "react";
import { useState, useEffect } from "react";
import Papa from "papaparse"; // Import PapaParse for CSV parsing
import { ToastContainer, toast } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";

import { Progress } from "@/components/ui/progress";

import TiptapEditor from "@/components/TipTap";

import { Trash, Upload } from "lucide-react"; // Import the icon
const API_BASE = "http://localhost:3001";

import supabase from "@/config/supabaseClient";

const page = () => {
  const { toast: notify } = useToast();
  const [randomValue, setRandomValue] = useState(null);

  const [remainingWait, setRemainingWait] = useState(6000);

  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [minDelay, setMinDelay] = useState(8000);
  const [maxDelay, setMaxDelay] = useState(15000);
  const [progress, setProgress] = useState({});
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState([]); // Holds contacts after CSV upload

  const [contactsTable, setContactsTable] = useState(
    contacts.map((contact) => ({ ...contact, sent: false }))
  );

  const [currentMessage, setCurrentMessage] = useState("");
  const [sendingStatus, setSendingStatus] = useState("idle");

  const [showConnectButton, setShowConnectButton] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(null);

  const [imgUrl, setImgUrl] = useState("");

  const [percentage, setPorcentaje] = useState(0);

  const [isValid, setIsValid] = useState(null);

  function formatMs(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // Format with leading zeros if needed
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Function to check if image exists
  const validateImageUrl = async (url) => {
    if (!url) {
      setIsValid(null);
      return;
    }

    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-cache" }); // Avoid cache issues
      if (response.ok) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      setIsValid(false);
    }
  };

  useEffect(() => {
    setPorcentaje(0);
    const totalDuration = 5000; // 5 seconds
    const updateFrequency = 100; // Update every 100ms
    const totalSteps = totalDuration / updateFrequency; // Total number of steps
    const increment = 100 / totalSteps; // Increment per step

    const interval = setInterval(() => {
      setPorcentaje((prev) => {
        const nextValue = prev + increment;
        if (nextValue >= 100) {
          clearInterval(interval); // Stop once progress reaches 100%
          return 100;
        }
        return nextValue;
      });
    }, updateFrequency);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [progress]);

  useEffect(() => {
    // Create an interval that ticks every second
    const tick = setInterval(() => {
      setRemainingWait((prev) => {
        if (prev === null) return null;
        // Decrement until we reach 0
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, []);

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
      message: message || "👈👈Escribe te mensaje para ver como se ve",
      time: "10:32 AM",
      isUser: true,
      image: imgUrl || null,
    },
    {
      sender: "John Doe",
      message: "Quiero un boleto!",
      time: "10:35 AM",
      isUser: false,
      image: null,
    },
  ];

  useEffect(() => {
    // Fetch current status on page load to get previous message template, delays, etc.
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE}/status`);
        setProgress(response.data.progress);
        setContacts(response.data.contacts);
        setContactsTable(
          response.data.contacts.map((contact) => ({ ...contact, sent: false }))
        );
        setCurrentMessage(response.data.message); // Load the current message template
        setSendingStatus(response.data.status); // Set the current sending status
        setMinDelay(response.data.minDelay || 1000); // Load saved min delay (default to 1000)
        setMaxDelay(response.data.maxDelay || 5000); // Load saved max delay (default to 5000)
      } catch (error) {
        console.error("Error fetching status:", error);
        toast.error("Failed to fetch current status.");
      }
    };

    const connectSession = async () => {
      try {
        const response = await axios.post(`${API_BASE}/connect`);

        toast.success(
          `Conectado exitosamente con ${response.data.phone.slice(0, 13)}`
        );

        setShowConnectButton(false);
        setConnectedAccount(response.data.phone.slice(0, 13));
        setQrCode("");
      } catch (error) {
        console.error("Error connecting session:", error);
        toast.error("Failed to connect session.");
      }
    };

    const socket = io(API_BASE);

    socket.on("qr", (qrData) => {
      setQrCode(qrData);
      toast.info("QR code updated. Please scan.");
    });

    socket.on("qrDone", (qrData) => {
      setQrCode("");
    });

    socket.on("message-progress", (data) => {
      setProgress(data);
      if (data.remainingWait === 0 || data.remainingWait === null) {
        notify({
          title: "Mensaje enviado Lote " + data.batch,
          description: "Mensaje enviado a " + data.current,
          duration: 5000,
        });
      }

      if (data.error) {
        toast.error(`Failed to send message to ${data.current}`);
      }

      if (data.status === "canceled") {
        toast.warn("Batch sending canceled.");
        setSending(false);
      }

      if (data.remainingWait !== undefined) {
        // When we get an update, set the state (in seconds)
        setRemainingWait(Math.ceil(data.remainingWait / 1000));
      } else {
        setRemainingWait(null);
      }

      // Mark the contact as sent
      setContactsTable((prevContacts) =>
        prevContacts.map((contact) =>
          contact.phone === data.current ? { ...contact, sent: true } : contact
        )
      );
    });

    connectSession();
    fetchStatus();

    return () => socket.disconnect();
  }, []);

  const connectWP = async () => {
    try {
      const response = await axios.post(`${API_BASE}/connect`);
      toast.success(
        `Conectado exitosamente con ${response.data.phone.slice(0, 13)}`
      );

      setShowConnectButton(false);
    } catch (error) {
      console.error("Error connecting session:", error);
      toast.error("Failed to connect session.");
    }
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

  const sendMessage = async () => {
    if (!contacts.length || !message) {
      toast.error("Contacts and message are required.");
      return;
    }

    if (minDelay > maxDelay) {
      toast.error("Minimum delay cannot be greater than maximum delay.");
      return;
    }

    try {
      setSendingStatus("sending");
      setSending(true);
      const response = await axios.post(`${API_BASE}/send-messages`, {
        contacts, // Sending the contacts array with name and phone
        message,
        minDelay,
        maxDelay,
        image: imgUrl,
      });

      // Check if the response status is 200 OK
      if (response.status === 200) {
        toast.success("Messages sent successfully!"); // Example of success notification
        // You can do anything here when the 200 status is received
        // For example, reset contacts or clear the message input
        setContacts([]); // Clear contacts list after sending
        setMessage(""); // Clear the message field
        setSendingStatus("idle");
      } else {
        toast.error("Unexpected response from the server.");
      }

      setSending(false);
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Failed to send messages.");
      setSending(false);
    }
  };

  const cancelSending = async () => {
    try {
      await axios.post(`${API_BASE}/cancel-sending`);
      setSending(false);
      setSendingStatus("canceled");
      setContacts([]);
      setContactsTable([]);

      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";

      setProgress({
        total: 0,
        completed: 0,
        current: null,
        status: "canceled",
      });

      toast.success("Sending canceled.");
      setMessage("");
      setCurrentMessage("");
    } catch (error) {
      console.error("Error canceling sending:", error);
      toast.error("Failed to cancel sending.");
    }
  };

  const resetSession = async () => {
    try {
      const response = await axios.post(`${API_BASE}/reset`);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error resetting session:", error);
      toast.error("Failed to reset session.");
    }
  };

  useEffect(() => {
    setRandomValue(Math.random());
  }, []); // Only run once on the client side

  if (randomValue === null) return null; // Avoid rendering before hydration

  return (
    <div>
      <ToastContainer />
      <Toaster />
      <div className="h-[75px] w-full bg-green-400 flex items-center px-4 poppins font-semibold">
        <h1>
          WhatsApp Bot <sub>by Raffly</sub>
        </h1>
      </div>
      <div className="h-[calc(100vh-75px)] w-full flex items-center justify-center ">
        <div className="h-full bg-slate-400 w-[16rem] flex flex-col px-4 gap-4">
          <h1>Sidebar</h1>
          <p>Campaña</p>
          <p>Contactos</p>
          <p>Configuraciones</p>
        </div>{" "}
        <div className="h-full bg-gray-100 w-full p-4 flex flex-col gap-1">
          <div className="w-full  flex items-center justify-between h-[75px]">
            <h1>Administrador de Campaña</h1>
            <button
              onClick={resetSession}
              className="flex items-center gap-4 bg-red-400 px-4 py-2 rounded cursor-pointer text-white poppins font-semibold"
            >
              Desconectar WhatsApp
            </button>

            {!showConnectButton && connectedAccount !== null ? (
              <>
                <div className="flex items-center gap-4">
                  {" "}
                  <button
                    onClick={resetSession}
                    className="flex items-center gap-4 bg-red-400 px-4 py-2 rounded cursor-pointer text-white poppins font-semibold"
                  >
                    Desconectar WhatsApp
                  </button>
                  <button className="flex items-center gap-4 bg-green-400 px-4 py-2 rounded cursor-pointer text-white poppins font-semibold">
                    Conectado a +{connectedAccount}
                  </button>
                </div>
              </>
            ) : null}
            {showConnectButton && (
              <button
                onClick={connectWP}
                className="flex items-center gap-4 bg-green-400 px-4 py-2 rounded cursor-pointer text-white poppins font-semibold"
              >
                Conectar WhatsApp
              </button>
            )}
          </div>
          {qrCode && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <h3>QR Code</h3>
              <img src={qrCode} alt="QR Code" style={{ maxWidth: "100%" }} />
            </div>
          )}
          <div className="w-full h-full max-h-[calc(100vh-75px-75px-15px-15px-75px)] flex items-center ">
            <div className="w-1/3 bg-slate-100 h-full">
              <div className="h-full w-full p-4">
                <div className="flex flex-col h-full gap-4  w-full bg-white border rounded-lg shadow-lg p-4">
                  <TiptapEditor setMessage={setMessage} />
                  <button
                    onClick={() => setIsValid(true)}
                    className="flex items-center gap-4 bg-red-400 px-4 py-2 rounded cursor-pointer text-white poppins font-semibold"
                  >
                    Ignorar
                  </button>
                  {isValid === false && (
                    <>
                      <button
                        onClick={() => setIsValid(true)}
                        className="flex items-center gap-4 bg-red-400 px-4 py-2 rounded cursor-pointer text-white poppins font-semibold"
                      >
                        Ignorar
                      </button>
                    </>
                  )}
                  <div className="w-full max-w-md mx-auto p-4">
                    <textarea
                      placeholder="Url de la imagen"
                      value={imgUrl}
                      onChange={(e) => {
                        validateImageUrl(e.target.value);
                        setImgUrl(e.target.value);
                      }}
                      className="w-full h-[100px] p-4 border border-gray-300 rounded-md"
                    ></textarea>

                    {isValid === true && (
                      <p className="text-green-600">✅ Imagen válida</p>
                    )}
                    {isValid === false && (
                      <p className="text-red-600">❌ URL no válida</p>
                    )}
                  </div>

                  <div className="border-t border-gray-300 pt-4 flex flex-col gap-4 w-full">
                    <div className="flex items-center gap-4 justify-center">
                      {sendingStatus === "idle" ||
                      sendingStatus === "canceled" ? (
                        <button
                          disabled={
                            sendingStatus === "sending" ||
                            !message ||
                            !isValid ||
                            contacts.length < 1
                          }
                          onClick={sendMessage}
                          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  ${
                            sendingStatus === "sending" ||
                            !isValid ||
                            !message ||
                            contacts.length < 1
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          Enviar Mensajes
                        </button>
                      ) : (
                        <>
                          <div className="w-full h-full flex flex-col items-center gap-4">
                            <div className="w-full h-full ">
                              <Progress value={percentage} />
                            </div>
                            <button
                              onClick={cancelSending}
                              disabled={
                                sendingStatus === "canceled" ||
                                sendingStatus === "idle"
                              }
                              className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                            >
                              Cancelar Envio
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/3 bg-slate-100 h-full">
              <div className="w-full h-full flex flex-col p-4">
                <div className="flex flex-col h-full  w-full bg-white border rounded-lg shadow-lg">
                  {/* Header */}
                  <div className="flex items-center p-4 border-b">
                    <div className="w-10 h-10 bg-green-500 rounded-full"></div>{" "}
                    {/* Placeholder for contact image */}
                    <div className="ml-3">
                      <h2 className="font-semibold text-lg">Rifas La Bola 8</h2>
                      <p className="text-sm text-gray-500">En Linea</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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

                          <span className="text-xs text-gray-500 w-full  text-right ">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/3 bg-slate-100  flex flex-col overflow-hidden h-full ">
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
                          document.getElementById(
                            "file-upload"
                          ) as HTMLInputElement
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
                            style={{
                              border: "1px solid #ddd",
                            }}
                          >
                            <td
                              style={{
                                padding: "8px",
                              }}
                            >
                              {contact.name}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                              }}
                            >
                              {contact.phone}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-[15px] bg-slate-100 mb-4 mt-4 relative">
            <Progress
              value={(progress.completed / progress.total) * 100}
              className="w-full"
            />
          </div>
          {progress && progress.total > 0 && (
            <div className="w-full h-[15px] flex items-center justify-center">
              {progress.remainingWait > 0 ? (
                <div>Next batch in: {formatMs(progress.remainingWait)}</div>
              ) : (
                <>
                  Sent {progress.completed} of {progress.total} messages.
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
