"use client";
import {
  Copy,
  Plus,
  PlusCircleIcon,
  Send,
  Settings,
  Settings2,
  Trash,
  Upload,
} from "lucide-react";
import React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatISO, set } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:3001";

const Home = () => {
  const { campaigns } = useSocket();

  const [availableAccounts, setAvailableAccounts] = useState(["Buscando..."]);

  const { toast: notify } = useToast();

  const [batchSize, setBatchSize] = useState(2);
  const [timeout, setTimeout] = useState(30);
  const [randomDelay, setRandomDelay] = useState([20000, 35000]);
  const [template, setTemplate] = useState();
  const [contacts, setContacts] = useState([]);

  const [datetime, setDatetime] = useState(new Date());

  const [imageUrl, setImageUrl] = useState("");

  const [contactsTable, setContactsTable] = useState([]);

  const [testAccount, setTestAccount] = useState("");

  const [account, setAccount] = useState("default");
  //console.log("Current account:", account);
  const [testMessage, setTestMessage] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [testImgUrl, setTestImgUrl] = useState("");

  const [currentCampaign, setCurrentCampaign] = useState({
    batchSize: 50,
    timeout: 120,
    randomDelay: [20000, 35000],
    account: "default",
    template: template ? template : "",
    contacts: [],
    datetime: new Date(),
    imageUrl: "",
    newCampaign: true,
    status: "No status",
    progress: 0,
    current: 0,
    lastPhone: "5216143035198",
  });

  useEffect(() => {
    const fetchFolderNames = async () => {
      try {
        // Replace 'your-bucket-name' with your actual bucket name
        const { data, error } = await supabase.storage
          .from("whatsapp-sessions")
          .list("", { limit: 100, offset: 0 });

        if (error) {
          console.error("Error fetching folders:", error);
          return;
        }

        // Extract unique folder names and store them in availableAccounts
        const folders = [
          ...new Set(data.map((file) => file.name.split("/")[0])),
        ];

        // Set the state with the folder names
        setAvailableAccounts(folders);
      } catch (error) {
        console.error("Error listing folders:", error);
      }
    };

    fetchFolderNames();
  }, []); // Empty dependency array to run only once on component load

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
    setAccount(currentCampaign.account);
  }, [currentCampaign]);

  /*
  useEffect(() => {
    if (campaigns.length > 0) {
      setCurrentCampaign({ ...campaigns[0], newCampaign: null });
    }
  }, []);
  */
  useEffect(() => {
    if (!currentCampaign || !campaigns.length) return;

    const updatedCampaign = campaigns.find(
      (campaign) => campaign.id === currentCampaign.id
    );

    if (
      updatedCampaign &&
      JSON.stringify(updatedCampaign) !== JSON.stringify(currentCampaign)
    ) {
      setCurrentCampaign((prev) => ({
        ...prev,
        ...updatedCampaign, // Update only available fields
      }));
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
  }, [currentCampaign?.lastPhone]);

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

  const handleCSVInput = (event) => {
    const pastedData = event.target.value;

    if (!pastedData) {
      toast.error("Por favor, pegue datos en el cuadro de texto.");
      return;
    }

    // Parse the pasted data (handling both commas and tab spaces)
    const rows = pastedData
      .trim()
      .split("\n")
      .map((row) => row.split(/\t|,/));

    if (rows.length < 2) {
      toast.error("El formato de los datos pegados no es válido.");
      return;
    }

    // Check headers
    const headers = rows[0].map((header) => header.trim().toLowerCase());
    if (headers[0] !== "name" || headers[1] !== "phone") {
      toast.error("El CSV debe tener 'name' y 'phone' en la primera fila.");
      return;
    }

    // Validate rows
    const invalidRows = [];
    const parsedContacts = rows
      .slice(1) // Skip headers
      .filter((row) => row.length >= 2 && row[0] && row[1]) // Ensure name & phone exist
      .map((row, index) => {
        const phone = row[1].trim();
        if (!/^\d{13}$/.test(phone)) {
          invalidRows.push(index + 2); // Store row number for error message
          return null; // Mark invalid rows
        }
        return {
          name: row[0].trim(),
          phone,
        };
      })
      .filter(Boolean); // Remove invalid rows (nulls)

    if (parsedContacts.length === 0) {
      toast.error("No se encontraron contactos válidos.");
      return;
    }

    if (invalidRows.length > 0) {
      toast.error(`${invalidRows.length} contactos no son válidos.`);
    }

    setContacts(parsedContacts);
    setContactsTable(
      parsedContacts.map((contact) => ({ ...contact, sent: false }))
    );

    toast.success("Lista de contactos cargada!");
  };

  const sendJson = async () => {
    const jsonData = buildJson();
    try {
      const response = await fetch(
        `http://localhost:3001/schedule-campaign/${account}`,
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

  const stopCampaign = async () => {
    if (!currentCampaign?.id) {
      console.error("No campaign ID found.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/stop-campaign/${currentCampaign.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to stop campaign: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Campaign stopped successfully:", result);
      setCurrentCampaign({
        batchSize: 50,
        timeout: 120,
        randomDelay: [20000, 35000],
        account: "default",
        template: "",
        contacts: [],
        datetime: new Date(),
        imageUrl: "",
        newCampaign: true,
        id: null,
        status: "creating...",

        progress: 0,
        current: 0,
      });
    } catch (error) {
      console.error("Error stopping campaign:", error);
    }
  };

  const handleSelectChange = (event) => {
    const selectedId = event.target.value;

    if (selectedId === "") {
      setCurrentCampaign({
        batchSize: 50,
        timeout: 120,
        randomDelay: [20000, 35000],
        account: "default",
        template: "",
        contacts: [],
        datetime: new Date(),
        imageUrl: "",
        newCampaign: true,

        status: "No status",
        progress: 0,
        current: 0,
      });
    } else {
      const selectedCampaign = campaigns.find((c) => c.id === selectedId);

      setCurrentCampaign({
        ...selectedCampaign,
        id: selectedId,
        newCampaign: null,
      });
    }
  };

  const handleStartSocket = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/start/${testAccount}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error starting socket:", error);
    }
  };

  const handleStopSocket = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/stop/${testAccount}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error stopping socket:", error);
    }
  };

  const handleSendTestMessage = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/send-message/${testAccount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: testNumber,
            message: testMessage,
            image: "",
          }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error sending test message:", error);
    }
  };

  return (
    <div className="w-screen h-screen max-h-screen p-5 flex flex-col overflow-hidden">
      {/* Header with fixed height */}
      <ToastContainer />
      <div className="h-16 w-full flex items-center gap-5 justify-between">
        <div className="flex gap-5 items-center">
          <h1 className="m-0">QQs Chat Bot</h1>
          {campaigns.length > 0 ? (
            <>
              {" "}
              <select
                value={currentCampaign?.id || ""}
                onChange={handleSelectChange}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.account} - {campaign.id}
                  </option>
                ))}
              </select>
              <PlusCircleIcon
                onClick={() =>
                  setCurrentCampaign({
                    batchSize: 50,
                    timeout: 120,
                    randomDelay: [20000, 35000],
                    account: "default",
                    template: "",
                    contacts: [],
                    datetime: new Date(),
                    imageUrl: "",
                    newCampaign: true,
                    id: null,
                    status: "creating...",

                    progress: 0,
                    current: 0,
                  })
                }
                className="w-6 h-6 cursor-pointer text-green-500"
              />
            </>
          ) : (
            <>
              <p>No campaigns available</p>
              <PlusCircleIcon
                onClick={() =>
                  setCurrentCampaign({
                    batchSize: 50,
                    timeout: 120,
                    randomDelay: [20000, 35000],
                    account: "default",
                    template: "",
                    contacts: [],
                    datetime: new Date(),
                    imageUrl: "",
                    newCampaign: true,
                    id: null,
                    status: "creating...",

                    progress: 0,
                    current: 0,
                  })
                }
                className="w-6 h-6  cursor-pointer text-green-500"
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger>
              {" "}
              <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded">
                <Send className="w-6 h-6" /> Enviar Mensaje de Prueba
              </button>
            </DialogTrigger>
            <DialogContent className="p-10">
              <DialogHeader>
                <DialogTitle className="mb-5 text-center">
                  Enviar Mensaje de Prueba
                </DialogTitle>

                <DialogDescription className="flex flex-col gap-5">
                  <div>
                    <span>
                      Selecciona de que numero quieres enviar el mensaje
                    </span>
                    <select
                      value={testAccount}
                      onChange={(e) => setTestAccount(e.target.value)}
                      id="account-select"
                      className="w-full border rounded-md px-3 py-2"
                    >
                      {availableAccounts.map((accountName) => (
                        <option key={accountName} value={accountName}>
                          {accountName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className=" hidden flex justify-between items-center">
                    {" "}
                    <span>Socket Status</span>
                    <Switch className="transform scale-[1.2]" />{" "}
                  </div>
                  <div className="flex flex-col">
                    {" "}
                    <span>Iniciar Socket</span>
                    <select
                      value={testAccount}
                      onChange={(e) => setTestAccount(e.target.value)}
                      id="account-select"
                      className="w-full border rounded-md px-3 py-2"
                    >
                      {availableAccounts.map((accountName) => (
                        <option key={accountName} value={accountName}>
                          {accountName}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-between items-center gap-2 mt-2">
                      <button
                        onClick={handleStartSocket}
                        className="w-full bg-blue-500 text-white px-4 py-2"
                      >
                        Iniciar
                      </button>
                      <button
                        onClick={handleStopSocket}
                        className="w-full bg-red-500 text-white px-4 py-2"
                      >
                        Detener
                      </button>
                    </div>
                  </div>
                  <div>
                    <span>Enviar mensaje a:</span>
                    <Input
                      onChange={(e) => setTestNumber(e.target.value)}
                      className="w-full"
                      placeholder="521 614 303 5198"
                    />
                  </div>
                  <div>
                    <span>Mensaje:</span>
                    <Input
                      className="w-full"
                      placeholder={`Hola, esta es una prueba`}
                      onChange={(e) => setTestMessage(e.target.value)}
                    />
                  </div>
                  <div>
                    <span>Url de Imagen:</span>
                    <Input
                      className="w-full"
                      placeholder={`Url de Imagen`}
                      onChange={(e) => setTestImgUrl(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleSendTestMessage}
                    className="w-full mt-5 bg-blue-500"
                  >
                    Enviar Mensaje
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
                  disabled={currentCampaign?.newCampaign === null}
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
                        disabled={currentCampaign?.newCampaign === null}
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        id="account-select"
                        className="w-full border rounded-md px-3 py-2"
                      >
                        {availableAccounts.map((accountName) => (
                          <option key={accountName} value={accountName}>
                            {accountName}
                          </option>
                        ))}
                      </select>
                      <Popover>
                        <PopoverTrigger>
                          <Settings className="w-6 h-6 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent></PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex items-center w-full gap-4">
                    <div className="flex w-full flex-col gap-2">
                      <label className="w-full" htmlFor="batch-size">
                        Batch Size
                      </label>
                      <Input
                        disabled={currentCampaign?.newCampaign === null}
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
                        disabled={currentCampaign?.newCampaign === null}
                        id="timeout"
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeout(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex w-full gap-2 items-center">
                    <div className="flex w-full flex-col gap-2">
                      <label className="w-full" htmlFor="random-delay-min">
                        Random Delay Min
                      </label>
                      <Input
                        disabled={currentCampaign?.newCampaign === null}
                        id="random-delay-min"
                        type="number"
                        value={randomDelay[0]}
                        onChange={(e) =>
                          setRandomDelay([
                            Number(e.target.value),
                            randomDelay[1],
                          ])
                        }
                      />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <label className="w-full" htmlFor="random-delay-max">
                        Random Delay Max
                      </label>
                      <Input
                        disabled={currentCampaign?.newCampaign === null}
                        id="random-delay-max"
                        type="number"
                        value={randomDelay[1]}
                        onChange={(e) =>
                          setRandomDelay([
                            randomDelay[0],
                            Number(e.target.value),
                          ])
                        }
                      />
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2">
                    <label className="w-full" htmlFor="random-delay">
                      Date and Time
                    </label>
                    <DatePicker
                      disabled={currentCampaign?.newCampaign === null}
                      selected={datetime ? new Date(datetime) : new Date()}
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
                      disabled={currentCampaign?.newCampaign === null}
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
                    currentCampaign?.newCampaign === null ||
                    template === "" ||
                    batchSize === 0 ||
                    timeout === 0 ||
                    !randomDelay ||
                    datetime === null ||
                    contacts.length === 0
                  }
                  className={`w-full font-bold text-[19px] mt-4 text-white ${
                    template === "" ||
                    currentCampaign?.newCampaign === null ||
                    batchSize === 0 ||
                    timeout === 0 ||
                    !randomDelay ||
                    contacts.length === 0 ||
                    datetime === null
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300"
                  } font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                  onClick={sendJson}
                >
                  {currentCampaign?.newCampaign === null
                    ? "Campaign alreadyScheduled or Running"
                    : "Create Campaign"}
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
                <button
                  onClick={stopCampaign}
                  className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 w-1/2 mx-auto"
                >
                  Cancelar/Detener Campaña
                </button>
                <hr className="w-full border-gray-300 my-2" />

                <Progress
                  value={currentCampaign?.lastPhone ? loader : 0}
                  color="blue"
                />
                <div className="w-full h-[15px] flex items-center justify-center">
                  <p className="text-sm text-gray-500">
                    {currentCampaign.lastPhone
                      ? `Mensaje enviado a ${currentCampaign.lastPhone}`
                      : currentCampaign?.status}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <hr className="w-full border-gray-300 my-2" />
                <Progress
                  value={currentCampaign ? currentCampaign.progress * 100 : 0}
                  color="green"
                />
                <div className="w-full h-[15px] flex items-center justify-center">
                  <p className="text-sm text-gray-500">
                    {currentCampaign?.progress
                      ? `${currentCampaign?.current}/${contacts.length}`
                      : currentCampaign?.status}
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
                  className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors"
                />
                <div className="flex gap-2 items-center">
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
                  <Popover>
                    <PopoverTrigger className="flex items-center justify-center cursor-pointer bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors">
                      <Copy className="w-5 h-5" />
                    </PopoverTrigger>
                    <PopoverContent>
                      {" "}
                      <textarea
                        className="w-full h-40 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pega aquí los datos CSV..."
                        onChange={handleCSVInput}
                        rows={6}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
                        className={
                          index < currentCampaign?.current ? "bg-green-100" : ""
                        }
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
