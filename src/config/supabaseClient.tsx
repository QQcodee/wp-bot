import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eseivxrgtjprkfbhxxrf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZWl2eHJndGpwcmtmYmh4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MDYxNDksImV4cCI6MjA1ODE4MjE0OX0.wQ44B4hYNVyEHWMZ2rG3yveqO0ypEc8vNdMAM3To0p4";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
