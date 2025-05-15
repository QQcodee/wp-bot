import React from "react";
import { ToastContainer, toast } from "react-toastify";

const page = () => {
  return (
    <div className="flex h-screen flex-col overflow-y-auto px-5 pb-5">
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <div className="flex items-center justify-between space-x-2">
        <h1 className="inline-flex gap-2 font-rubik text-4xl font-bold">
          Configuracion{" "}
        </h1>
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-4 border-gray-200 pb-10"></div>
    </div>
  );
};

export default page;
