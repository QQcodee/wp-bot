"use client";
import React, { use } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
const page = () => {
  const router = useRouter();
  const { id } = useParams();
  useEffect(() => {
    toast.success("Hello, world!");
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-y-auto px-5 pb-5">
      {/* Header */}
      <div className="flex items-center justify-between space-x-2">
        <h1 className="inline-flex gap-2 font-rubik text-4xl font-bold">
          Campaña {id}
        </h1>
      </div>

      {/* Main content */}
    </div>
  );
};

export default page;
