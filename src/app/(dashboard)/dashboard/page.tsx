"use client";
import React from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const page = () => {
  const { workspace } = useWorkspace();
  return (
    <div className="h-full px-5">
      <h1 className="font-rubik text-4xl font-bold">
        Bienvenido al Dashboard de{" "}
        <span className="font-extrabold text-green-500">
          {" "}
          {workspace?.name}
        </span>
      </h1>
    </div>
  );
};

export default page;
