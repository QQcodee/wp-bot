"use client";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import React from "react";
import { ToastContainer } from "react-toastify";

import { useSocket } from "@/hooks/use-socket";

const page = () => {
  const { campaigns } = useSocket();

  console.log(campaigns);
  return (
    <div className="flex h-screen flex-col overflow-y-auto px-5 pb-5">
      {/* Header */}
      <div className="flex items-center justify-between space-x-2">
        <h1 className="inline-flex gap-2 font-rubik text-4xl font-bold">
          Campañas{" "}
        </h1>
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-4 border-gray-200 pb-10">
        {campaigns?.map((campaign) => (
          <WorkflowCard
            account={campaign.account}
            name={campaign.account}
            id={campaign.id}
            progress={campaign.progress}
            current={campaign.current}
            length={campaign.contacts.length}
            statusInfo={campaign.status}
          />
        ))}
        <WorkflowCard />
      </div>
    </div>
  );
};

export default page;

const WorkflowCard = ({
  current = 0,
  account = "default",
  name = "Mi primera campaña",
  id = "123",
  phone = "+52 1 614 303 5198",
  progress = Math.floor(Math.random() * 100),
  status = "active",
  statusInfo = "",
  length = 10,
}: {
  account: string;
  current: number;
  name: string;
  id: string;
  phone: string;
  progress: number;
  status: string;
  statusInfo: string;
  length: number;
}) => {
  return (
    <div
      className={cn(
        "flex h-[180px] w-full justify-between rounded border bg-stone-100/40 p-4",
      )}
    >
      <div className="flex w-full flex-col justify-between gap-2">
        <div>
          {" "}
          <span className="flex w-full items-center justify-between">
            <p className="text-lg font-bold">{name}</p>
            <span className="flex items-center gap-2 text-sm font-light text-stone-700">
              <Copy /> ID: {id}
            </span>
          </span>
          <p className="text-sm">{phone}</p>
        </div>
        {statusInfo.length > 0 && (
          <p className="font-regular text-sm">{statusInfo}</p>
        )}

        <div className="flex flex-col gap-2">
          <Progress
            color={cn({
              green: status === "active" || status === "completed",
              blue: status === "paused",
              red: status === "failed",
            })}
            className="h-[15px] w-full"
            value={progress * 100}
          />

          <p className="text-center text-sm text-gray-500">
            {current}/{length}
          </p>
        </div>
      </div>
    </div>
  );
};

/*

 {
          "bg-green-200/30": status === "completed",
          "bg-red-200/30": status === "failed",
          "bg-stone-300/50": status === "paused",
        },*/
