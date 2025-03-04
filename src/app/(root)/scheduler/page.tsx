"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Papa from "papaparse";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const timezones = [
  { label: "GMT-6", value: "-06:00" },
  { label: "GMT-5", value: "-05:00" },
  { label: "GMT-4", value: "-04:00" },
  { label: "GMT+0", value: "+00:00" },
  { label: "GMT+1", value: "+01:00" },
  { label: "GMT+2", value: "+02:00" },
];

const page = () => {
  const [batchSize, setBatchSize] = useState(2);
  const [timeout, setTimeout] = useState(30);
  const [randomDelay, setRandomDelay] = useState([10000, 15000]);
  const [template, setTemplate] = useState("Hello");
  const [contacts, setContacts] = useState([]);

  const [datetime, setDatetime] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      complete: (results) => {
        const phones = results.data.flat().filter(Boolean);
        setContacts(phones.map((phone) => ({ phone })));
      },
    });
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

  const handleChange = (date) => {
    setDatetime(date);
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

  return (
    <div className="p-4 space-y-4 flex justify-center flex-col items-center w-screen">
      <div className="flex items-center">
        <label className="w-20" htmlFor="batch-size">
          Batch Size
        </label>
        <Input
          id="batch-size"
          type="number"
          value={batchSize}
          onChange={(e) => setBatchSize(Number(e.target.value))}
        />
      </div>
      <div className="flex items-center">
        <label className="w-20" htmlFor="timeout">
          Timeout
        </label>
        <Input
          id="timeout"
          type="number"
          value={timeout}
          onChange={(e) => setTimeout(Number(e.target.value))}
        />
      </div>
      <div className="flex items-center">
        <label className="w-20" htmlFor="random-delay">
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
      <div className="flex items-center">
        <label className="w-20" htmlFor="template">
          Template Message
        </label>
        <Textarea
          id="template"
          placeholder="Template Message"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <label className="w-20" htmlFor="csv">
          CSV File
        </label>
        <Input id="csv" type="file" accept=".csv" onChange={handleCSVUpload} />
      </div>
      <div>
        <DatePicker
          selected={datetime}
          onChange={handleChange}
          showTimeSelect
          dateFormat="Pp"
          timeIntervals={1}
        />
      </div>
      <div className="flex items-center">
        <label className="w-20" htmlFor="image-url">
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
      <Button onClick={sendJson}>Send JSON</Button>
      <Button onClick={buildJson}>Build JSON</Button>
    </div>
  );
};

export default page;
