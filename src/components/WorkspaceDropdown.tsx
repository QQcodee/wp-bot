"use client";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

// Initialize Supabase client
import supabase from "@/config/supabaseClient";

const WorkspaceDropdown = () => {
  const { workspace, changeWorkspace } = useWorkspace();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("workspaces").select("*");
      if (error) console.error("Error fetching workspaces:", error);
      else setWorkspaces(data);
      setLoading(false);
    };

    fetchWorkspaces();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full border" asChild>
        <button className="flex w-full items-center justify-between rounded-md border px-4 py-2">
          {workspace ? workspace.name : "Seleccionar clínica"}
          <ChevronDown className="ml-auto" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="z-10 w-full rounded-md bg-white p-2 shadow-lg">
        {loading ? (
          <DropdownMenuItem disabled className="p-2 text-gray-500">
            Loading...
          </DropdownMenuItem>
        ) : workspaces.length > 0 ? (
          workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              className="cursor-pointer p-2 hover:bg-gray-200"
              onClick={() => changeWorkspace(ws)}
            >
              {ws.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="p-2 text-gray-500">
            No workspaces available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkspaceDropdown;
