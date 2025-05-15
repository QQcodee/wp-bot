import React from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

export default async function DemoPage() {
  return (
    <div className="h-screen w-full px-5">
      {/* @ts-ignore */}
      <DataTable columns={getColumns} />
    </div>
  );
}
