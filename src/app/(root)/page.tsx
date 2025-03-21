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
        : null, // Use null instead of "" to clear the DatePicker properly
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
      (campaign) => campaign.id === currentCampaign.id,
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
              "El archivo CSV debe tener las columnas 'name' y 'phone' en la primera fila.",
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
            parsedContacts.map((contact) => ({ ...contact, sent: false })),
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
      parsedContacts.map((contact) => ({ ...contact, sent: false })),
    );

    toast.success("Lista de contactos cargada!");
  };
  const [isLoading, setIsLoading] = useState(false);

  const sendJson = async () => {
    setIsLoading(true);
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
        },
      );
      const result = await response.json();
      console.log("Response:", result);
    } catch (error) {
      console.error("Error:", error);
    }
    setCurrentCampaign({
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
    setIsLoading(false);
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
        },
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
        },
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
        },
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
            image: testImgUrl || "",
          }),
        },
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
    <div className="flex h-screen max-h-screen w-screen flex-col overflow-hidden p-5">
      {/* Header with fixed height */}
      <ToastContainer />
      <div className="flex h-16 w-full items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h1 className="m-0">QQs Chat Bot</h1>
          {campaigns.length > 0 ? (
            <>
              {" "}
              <select
                value={currentCampaign?.id || ""}
                onChange={handleSelectChange}
                className="rounded-md border border-gray-300 px-2 py-1"
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
                className="h-6 w-6 cursor-pointer text-green-500"
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
                className="h-6 w-6 cursor-pointer text-green-500"
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger>
              {" "}
              <button className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white">
                <Send className="h-6 w-6" /> Enviar Mensaje de Prueba
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
                      className="w-full rounded-md border px-3 py-2"
                    >
                      {availableAccounts.map((accountName) => (
                        <option key={accountName} value={accountName}>
                          {accountName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex hidden items-center justify-between">
                    {" "}
                    <span>Socket Status</span>
                    <Switch className="scale-[1.2] transform" />{" "}
                  </div>
                  <div className="flex flex-col">
                    {" "}
                    <span>Iniciar Socket</span>
                    <select
                      value={testAccount}
                      onChange={(e) => setTestAccount(e.target.value)}
                      id="account-select"
                      className="w-full rounded-md border px-3 py-2"
                    >
                      {availableAccounts.map((accountName) => (
                        <option key={accountName} value={accountName}>
                          {accountName}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={handleStartSocket}
                        className="w-full bg-blue-500 px-4 py-2 text-white"
                      >
                        Iniciar
                      </button>
                      <button
                        onClick={handleStopSocket}
                        className="w-full bg-red-500 px-4 py-2 text-white"
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
                    className="mt-5 w-full bg-blue-500"
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
      <div className="grid w-full flex-1 grid-cols-3 gap-5 overflow-hidden">
        {/* First Column */}
        <div className="max-h-screen overflow-auto">
          <div className="h-full w-full p-4">
            <div className="flex h-full max-h-screen w-full flex-col justify-between overflow-auto rounded-lg border bg-white px-4 py-4 shadow-lg">
              <div className="flex w-full flex-col gap-2">
                <label className="w-full">Template Message</label>
                <Textarea
                  disabled={currentCampaign?.newCampaign === null}
                  id="template"
                  placeholder="Mensaje"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="h-32 w-full"
                />
              </div>
              <div className="flex flex-1 flex-col items-center justify-end overflow-auto">
                <div className="flex w-full flex-col items-center space-y-4 p-4">
                  <div className="flex w-full flex-col gap-2">
                    <label className="w-full" htmlFor="batch-size">
                      Account
                    </label>
                    <div className="flex w-full items-center gap-2">
                      <select
                        disabled={currentCampaign?.newCampaign === null}
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        id="account-select"
                        className="w-full rounded-md border px-3 py-2"
                      >
                        {availableAccounts.map((accountName) => (
                          <option key={accountName} value={accountName}>
                            {accountName}
                          </option>
                        ))}
                      </select>
                      <Popover>
                        <PopoverTrigger>
                          <Settings className="h-6 w-6 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent></PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-4">
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
                  <div className="flex w-full items-center gap-2">
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
                      className="w-full rounded-md border border-gray-300 p-2"
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
                  className={`mt-4 w-full text-[19px] font-bold text-white ${
                    template === "" ||
                    currentCampaign?.newCampaign === null ||
                    batchSize === 0 ||
                    timeout === 0 ||
                    !randomDelay ||
                    contacts.length === 0 ||
                    datetime === null
                      ? "cursor-not-allowed bg-gray-300"
                      : "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  } rounded-lg px-5 py-2.5 text-center text-sm font-medium`}
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
        <div className="flex h-full flex-col overflow-hidden">
          {/* Chat Section (3/4 height) */}
          <div className="flex max-h-[75vh] w-full flex-1 flex-col overflow-hidden p-4">
            <div className="flex h-full w-full flex-col rounded-lg border bg-white shadow-lg">
              {/* Header */}
              <div className="flex items-center border-b p-4">
                <div className="h-10 w-10 rounded-full bg-green-500"></div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold">Consultorio Dental</h2>
                  <p className="text-sm text-gray-500">En Línea</p>
                </div>
              </div>

              {/* Messages (Fix Overflow) */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-xs flex-col rounded-lg border p-3 ${
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
                          className="mb-2 mt-2 rounded-lg"
                        />
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <span className="w-full text-right text-xs text-gray-500">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input Section (1/4 height) */}
          <div className="h-[25vh] w-full flex-shrink-0 p-4">
            <div className="flex h-full w-full flex-col justify-between gap-2 rounded-lg border bg-white p-4 shadow-lg">
              <div className="flex flex-col gap-2">
                <h2 className="text-center">
                  Enviando mensajes desde
                  {"   "}({currentCampaign?.account})
                </h2>
                <button
                  onClick={stopCampaign}
                  className="mx-auto w-1/2 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Cancelar/Detener Campaña
                </button>
                <hr className="my-2 w-full border-gray-300" />

                <Progress
                  value={currentCampaign?.lastPhone ? loader : 0}
                  color="blue"
                />
                <div className="flex h-[15px] w-full items-center justify-center">
                  <p className="text-sm text-gray-500">
                    {currentCampaign.lastPhone
                      ? `Mensaje enviado a ${currentCampaign.lastPhone}`
                      : currentCampaign?.status}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <hr className="my-2 w-full border-gray-300" />
                <Progress
                  value={currentCampaign ? currentCampaign.progress * 100 : 0}
                  color="green"
                />
                <div className="flex h-[15px] w-full items-center justify-center">
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
          <div className="flex h-full w-full flex-col p-4">
            <div className="flex h-full w-full flex-col gap-4 rounded-lg border bg-white p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
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
                  className="h-5 w-5 cursor-pointer transition-colors hover:text-red-500"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer items-center justify-center rounded-lg bg-blue-500 p-2 text-white shadow-lg transition-colors hover:bg-blue-600"
                  >
                    <Upload className="h-5 w-5" />
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    style={{ display: "none" }}
                  />

                  <Popover>
                    <PopoverTrigger className="flex cursor-pointer items-center justify-center rounded-lg bg-blue-500 p-2 text-white shadow-lg transition-colors hover:bg-blue-600">
                      <Copy className="h-5 w-5" />
                    </PopoverTrigger>
                    <PopoverContent>
                      {" "}
                      <Textarea
                        className="h-40 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pega aquí los datos CSV..."
                        onChange={handleCSVInput}
                        rows={6}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="h-full w-full overflow-y-auto">
                <table className="h-full w-full overflow-y-auto">
                  <thead className="rounded-t bg-gray-100 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-2">Nombre</th>
                      <th className="px-4 py-2">Teléfono</th>
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
