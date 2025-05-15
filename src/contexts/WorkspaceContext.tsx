import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
import supabase from "@/config/supabaseClient";
// Create the context
const WorkspaceContext = createContext();

// Provider component
export const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("workspaces").select("*");

      if (error) {
        console.error("Error fetching workspaces:", error);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setWorkspace(null);
        setLoading(false);
        return;
      }

      const storedWorkspaceId = localStorage.getItem("workspaceId");
      const selectedWorkspace = data.find((ws) => ws.id === storedWorkspaceId);

      // Set the first workspace if none is selected
      const defaultWorkspace = selectedWorkspace || data[0];
      setWorkspace(defaultWorkspace);
      localStorage.setItem("workspaceId", defaultWorkspace.id);

      setLoading(false);
    };

    fetchWorkspaces();
  }, []);

  const changeWorkspace = (newWorkspace) => {
    setWorkspace(newWorkspace);
    localStorage.setItem("workspaceId", newWorkspace.id);
    //window.location.reload(); // Refresh to apply changes (optional)
  };

  return (
    <WorkspaceContext.Provider value={{ workspace, changeWorkspace, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook to access workspace context
export const useWorkspace = () => useContext(WorkspaceContext);
