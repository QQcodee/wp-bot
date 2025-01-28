import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ivltiudjxnrytalzxfwr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bHRpdWRqeG5yeXRhbHp4ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMTMzNzgsImV4cCI6MjAzMTc4OTM3OH0.th0QprBpNXFyh3pZ_yUwEsy1ge7fOfNzd7pzTpGRwZE";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
