"use client";
import { Copy, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContacts } from "@/contexts/ContactsContext";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { ToastProvider } from "@radix-ui/react-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import supabase from "@/config/supabaseClient";

const UploadContacts = () => {
  //@ts-ignore
  const { workspace } = useWorkspace();
  const {
    contacts,
    updateContacts,
    resetContacts,
    updateSelectedContacts,
    selectedContacts,
  } = useContacts();

  const handleCSVInput = (event: any) => {
    const pastedData = event.target.value;

    if (!pastedData) {
      toast.error("Por favor, pegue datos en el cuadro de texto.");
      return;
    }

    // Parse the pasted data (handling both commas and tab spaces)
    const rows = pastedData
      .trim()
      .split("\n")
      .map((row: string) => row.split(/\t|,/));

    if (rows.length < 2) {
      toast.error("El formato de los datos pegados no es válido.");
      return;
    }

    // Check headers
    const headers = rows[0].map((header: any) => header.trim().toLowerCase());
    if (headers[0] !== "name" || headers[1] !== "phone") {
      toast.error("El CSV debe tener 'name' y 'phone' en la primera fila.");
      return;
    }

    // Validate rows
    const invalidRows = [];
    const parsedContacts = rows
      .slice(1) // Skip headers
      .filter((row: any) => row.length >= 2 && row[0] && row[1]) // Ensure name & phone exist
      .map((row: any, index: any) => {
        const phone = row[1].trim();
        if (!/^\d{13}$/.test(phone)) {
          invalidRows.push(index + 2); // Store row number for error message
          return null; // Mark invalid rows
        }
        return {
          name: row[0].trim(),
          phone,
        };
      })
      .filter(Boolean); // Remove invalid rows (nulls)

    if (parsedContacts.length === 0) {
      toast.error("No se encontraron contactos válidos.");
      return;
    }

    if (invalidRows.length > 0) {
      toast.error(`${invalidRows.length} contactos no son válidos.`);
    }

    updateContacts(parsedContacts);

    toast.success("Lista de contactos cargada!");
  };

  const uploadContacts = async () => {
    //@ts-ignore
    updateSelectedContacts({});
    resetContacts();
    const addTag = prompt("¿Desea agregar alguna etiqueta a los contactos?");

    if (!workspace) {
      toast.error("Por favor, seleccione un workspace.");
      return;
    }

    const { data, error } = await supabase.from("contacts").insert(
      contacts.map((contact) => ({
        ...contact,
        workspace_id: workspace.id,
        lada: contact.phone.substring(3, 6),
        tags: addTag ? [addTag] : [],
        created_at: new Date().toISOString(),
      })),
    );
    if (error) {
      console.error(error);
    } else {
      toast.success("Contactos agregados exitosamente.");
      //console.log(data);
    }
  };
  return (
    <div>
      <ToastProvider />
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
            {" "}
            <Upload />
            Subir Contactos
          </Button>
        </DialogTrigger>
        <DialogContent className="flex h-[50vh] w-full max-w-[800px] flex-col">
          <DialogHeader>
            <DialogTitle className="text-center">Subir Contactos</DialogTitle>
          </DialogHeader>
          <Textarea
            onChange={handleCSVInput}
            rows={2}
            placeholder="Pega aqui los datos CSV..."
          />
          <ScrollArea className="flex-1 overflow-y-auto rounded-md">
            <div className="w-full">
              <table className="w-full text-left">
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Telefono</th>
                </tr>
                {contacts.map((contact) => (
                  <tr className="border-b" key={contact.phone}>
                    <td className="px-4 py-2">{contact.name}</td>
                    <td className="px-4 py-2">{contact.phone}</td>
                  </tr>
                ))}
              </table>
            </div>
          </ScrollArea>

          <DialogFooter className="flex w-full items-center justify-between">
            <DialogClose asChild>
              <Button type="button" variant="destructive">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={uploadContacts}
              type="button"
              className="bg-blue-500"
            >
              Continuar
            </Button>
            <Button
              type="button"
              variant={"destructive"}
              onClick={() => {
                resetContacts();
                toast.success("Contactos eliminados exitosamente.");
              }}
            >
              Eliminar Contactos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadContacts;
