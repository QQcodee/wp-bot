import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the type for a single contact
interface Contact {
  name: string;
  phone: string;
}

// Define the type for the context value
interface ContactsContextType {
  contacts: Contact[];
  selectedContacts: {};
  updateContacts: (newContacts: Contact[]) => void;
  resetContacts: () => void;
  updateSelectedContacts: () => void;
}

// Create Context with an initial empty state
const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined,
);

// Provider Component
interface ContactsProviderProps {
  children: ReactNode;
}

export const ContactsProvider: React.FC<ContactsProviderProps> = ({
  children,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState({});

  // Load contacts from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem("contacts");
    const selectedContacts = localStorage.getItem("selectedContacts");
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    if (selectedContacts) {
      setSelectedContacts(JSON.parse(selectedContacts));
    }
  }, []);

  // Function to update contacts and save to localStorage
  const updateContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem("contacts", JSON.stringify(newContacts));
  };

  // Function to reset contacts and remove from localStorage
  const resetContacts = () => {
    setContacts([]);
    localStorage.removeItem("contacts");
  };

  const updateSelectedContacts = (newContacts) => {
    setSelectedContacts(newContacts);
    localStorage.setItem("selectedContacts", JSON.stringify(newContacts));
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        selectedContacts,
        updateContacts,
        resetContacts,
        updateSelectedContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

// Custom hook to use ContactsContext
export const useContacts = (): ContactsContextType => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};
