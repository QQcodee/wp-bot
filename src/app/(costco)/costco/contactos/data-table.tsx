"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getColumns } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import supabase from "@/config/supabaseClient";
import { useRouter } from "next/navigation";
import {
  ArrowUpFromDotIcon,
  Calendar1Icon,
  Contact2,
  Contact2Icon,
  Copy,
  MapPin,
  MinusCircleIcon,
  PhoneIcon,
  Plus,
  PlusCircleIcon,
  SendHorizonal,
  TagIcon,
  Tags,
  TagsIcon,
  Trash2Icon,
  Upload,
  User2,
  UserRoundX,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, toast } from "react-toastify";

import { DatePickerWithRange } from "@/components/DateRange";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useContacts } from "@/contexts/ContactsContext";
import UploadContacts from "./_components/UploadContacts";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

interface Data {
  name: string;
  phone: string;
  tags: string;
  created_at: string;
}

export function DataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  //@ts-ignore
  const { workspace } = useWorkspace();

  const {
    contacts: contextContacts,
    selectedContacts,
    updateContacts,
    resetContacts,
    updateSelectedContacts,
  } = useContacts();

  const [data, setData] = useState<Data[]>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const handleDateChange = (range: { from: Date | null; to: Date | null }) => {
    setDateRange(range);
  };

  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      const rowDate = new Date(row.created_at);

      // Ensure dateRange is defined and contains both from and to dates
      if (dateRange?.from && dateRange?.to) {
        return rowDate >= dateRange.from && rowDate <= dateRange.to;
      }

      // If no date range is selected, return all rows
      return true;
    });
  }, [data, dateRange]);

  const [rowSelection, setRowSelection] = React.useState({});

  useEffect(() => {
    setRowSelection(selectedContacts);
  }, [contextContacts, selectedContacts]); // Runs when `contextContacts` changes

  //console.log("contextContacts", contextContacts);

  const [pageSize, setPageSize] = useState(10);

  const [currentTable, setCurrentTable] = useState("contacts");

  useEffect(() => {
    if (!workspace?.id) return;
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from(`${currentTable}`)
        .select("*")
        .eq("workspace_id", workspace?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setData(data);
      }
    };
    fetchContacts();
  }, [workspace?.id]);

  const onAddTag = async (rowId: number) => {
    const newTag = prompt("Enter a new tag:");
    if (!newTag) return;

    const existingTags =
      data.find((row: any) => row.index === rowId)?.tags || [];
    //@ts-ignore
    if (existingTags.includes(newTag)) {
      alert(`The tag ${newTag} already exists for this contact.`);
      return;
    }

    const updatedTags = [...existingTags, newTag];

    const { error } = await supabase
      .from(currentTable)
      .update({ tags: updatedTags })
      .eq("index", rowId);

    if (error) {
      console.error(error);
      toast.error("Error al agregar etiqueta.");
    } else {
      setData((prevData: any) =>
        prevData.map((row: any) =>
          row.index === rowId ? { ...row, tags: updatedTags } : row,
        ),
      );
      toast.success("Etiqueta agregada exitosamente.");
    }
  };

  const removeTag = async (rowId: number, tag: string) => {
    const confirmRemove = window.confirm(
      `¿Está seguro de que desea eliminar la etiqueta "${tag}"?`,
    );
    if (!confirmRemove) return;
    //@ts-ignore
    const row = data.find((row) => row.index === rowId);
    if (!row) return;
    //@ts-ignore
    const updatedTags = row.tags.filter((existingTag) => existingTag !== tag);

    const { error } = await supabase
      .from(currentTable)
      .update({ tags: updatedTags })
      .eq("index", rowId);

    if (error) {
      console.error(error);
      toast.error("Error al eliminar etiqueta.");
    } else {
      setData((prevData) =>
        prevData.map((row) =>
          //@ts-ignore
          row.index === rowId ? { ...row, tags: updatedTags } : row,
        ),
      );
      toast.success("Etiqueta eliminada exitosamente.");
    }
  };

  const onDeleteContact = async (rowId: number) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este contacto? Esta acción es irreversible.",
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from(currentTable)
      .delete()
      .eq("index", rowId);

    if (error) {
      console.error(error);
      toast.error("Error al eliminar el contacto.");
    } else {
      //@ts-ignore
      setData((prevData) => prevData.filter((row) => row.index !== rowId));
      toast.success("Contacto eliminado correctamente.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns: getColumns(onAddTag, removeTag, onDeleteContact), // Pass function to columns
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const [contacts, setContacts] = useState<any[]>([]);

  const uploadContacts = async () => {
    //@ts-ignore
    updateSelectedContacts({});
    resetContacts();
    const addTag = prompt("¿Desea agregar alguna etiqueta a los contactos?");

    const { data, error } = await supabase.from("contacts").insert(
      contacts.map((contact) => ({
        ...contact,
        workspace_id: workspace.id,
        lada: contact.phone.substring(3, 6),
        tags: addTag ? [addTag] : [],
      })),
    );
    if (error) {
      console.error(error);
    } else {
      toast.success("Contactos agregados exitosamente.");
      //console.log(data);
    }
    window.location.reload();
  };

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
      .map((row: any) => row.split(/\t|,/));

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

    setContacts(parsedContacts);
    updateContacts(parsedContacts);

    toast.success("Lista de contactos cargada!");
  };

  const handleAgregarEtiquetas = async () => {
    const selectedRows = table.getSelectedRowModel().flatRows;

    const newTag = prompt("Ingrese una nueva etiqueta:");

    const confirm = window.confirm("¿Deseas agregar etiquetas?");
    if (!confirm) return;

    if (newTag) {
      //@ts-ignore
      setData((prevData) =>
        prevData.map((row) => {
          if (
            selectedRows.some(
              //@ts-ignore
              (selectedRow) => selectedRow.original.id === row.id,
            )
          ) {
            const updatedTags = row.tags.includes(newTag)
              ? row.tags
              : [...row.tags, newTag];

            supabase
              .from("contacts")
              .update({ tags: updatedTags, updated_at: new Date() })
              //@ts-ignore
              .eq("id", row.id)
              .then(({ error }) => {
                if (error) console.error("Error updating tags:", error);
              });

            return { ...row, tags: updatedTags };
          }
          return row;
        }),
      );
    }

    toast.success("Etiquetas agregadas exitosamente.");
  };

  const handleRemoverEtiquetas = async () => {
    const selectedRows = table.getSelectedRowModel().flatRows;
    const removeTag = prompt("Ingrese una etiqueta para remover:");
    const confirm = window.confirm("¿Deseas remover etiquetas?");
    if (!confirm) return;

    if (removeTag) {
      setData((prevData) =>
        prevData.map((row) => {
          if (
            selectedRows.some(
              //@ts-ignore
              (selectedRow) => selectedRow.original.id === row.id,
            )
          ) {
            //@ts-ignore
            const updatedTags = row.tags.filter((tag) => tag !== removeTag);

            supabase
              .from("contacts")
              .update({ tags: updatedTags, updated_at: new Date() })
              //@ts-ignore
              .eq("id", row.id)
              .then(({ error }) => {
                if (error) console.error("Error updating tags:", error);
              });

            return { ...row, tags: updatedTags };
          }
          return row;
        }),
      );
    }

    toast.success("Etiquetas removidas exitosamente.");
  };

  const handleSelectAllFiltered = () => {
    const filteredRowIds = table
      .getFilteredRowModel()
      .rows.map((row) => row.id);
    setRowSelection(
      filteredRowIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
    );
  };

  const handleContextContacts = () => {
    const selectedRows = table.getSelectedRowModel().flatRows;
    const selectedContacts = selectedRows.map((row) => ({
      name: row.original.name,
      phone: row.original.phone,
    }));
    updateContacts(selectedContacts);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between space-x-2 pb-4">
        <h1 className="inline-flex gap-2 font-rubik text-4xl font-bold">
          Contactos{" "}
        </h1>

        <div className="flex flex-col items-end gap-4 space-x-2">
          <Button
            disabled={
              table.getFilteredSelectedRowModel().rows.length <= 0 &&
              contextContacts.length <= 0
            }
            variant={"outline"}
            className={cn({
              "border-green-500 bg-green-400/20 text-green-500 hover:bg-green-600 hover:text-white":
                table.getFilteredSelectedRowModel().rows.length > 0 ||
                contextContacts.length > 0,
            })}
            onClick={() => {
              updateContacts(
                table
                  .getFilteredSelectedRowModel()
                  .rows.map((row) => row.original),
              );
              //@ts-ignore
              updateSelectedContacts(rowSelection);
              router.push("/dashboard/workflows/crear");
            }}
          >
            <SendHorizonal /> Crear Campaña con contactos seleccionados{" "}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Contact2Icon />
            <Input
              placeholder="Filtrar por nombre..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <PhoneIcon />
            <Input
              placeholder="Filtrar por telefono..."
              value={
                (table.getColumn("phone")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("phone")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <MapPin />
            <Input
              placeholder="Filtrar por lada..."
              value={
                (table.getColumn("lada")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("lada")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <TagIcon />
            <Input
              placeholder="Filtrar por etiqueta..."
              value={
                (table.getColumn("tags")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("tags")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* @ts-ignore */}
            <DatePickerWithRange onDateChange={handleDateChange} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              disabled={table.getFilteredSelectedRowModel().rows.length <= 0}
              variant={"outline"}
              className={cn({
                "border-blue-500 bg-blue-400/20 text-blue-500 hover:bg-blue-600 hover:text-white":
                  table.getFilteredSelectedRowModel().rows.length > 0,
              })}
              onClick={handleAgregarEtiquetas}
            >
              Agregar
              <TagsIcon className="" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={table.getFilteredSelectedRowModel().rows.length <= 0}
              variant={"outline"}
              className={cn({
                "border-red-500 bg-red-400/20 text-red-500 hover:bg-red-600 hover:text-white":
                  table.getFilteredSelectedRowModel().rows.length > 0,
              })}
              onClick={handleRemoverEtiquetas}
            >
              Eliminar
              <Tags className="" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={table.getFilteredSelectedRowModel().rows.length <= 0}
              variant={"outline"}
              className={cn({
                "border-red-500 bg-red-400/20 text-red-500 hover:bg-red-600 hover:text-white":
                  table.getFilteredSelectedRowModel().rows.length > 0,
              })}
              //onClick={}
            >
              Eliminar Seleccionados
              <UserRoundX className="" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 pb-2 pl-2 pt-2 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              onClick={() => {
                setRowSelection({});
                //@ts-ignore
                updateSelectedContacts({});
              }}
              variant="ghost"
              className="h-6 w-6 rounded-full p-2 text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} contacto(s) seleccionados.
          {table.getFilteredRowModel().rows.length > 0 && (
            <Button
              onClick={handleSelectAllFiltered}
              variant="ghost"
              className="rounded-full p-2 text-blue-500"
            >
              Seleccionar Todos
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <UploadContacts />
          <Button
            variant={"outline"}
            onClick={() => {
              resetContacts();
              //@ts-ignore
              updateSelectedContacts({});
            }}
          >
            Reset
          </Button>
          <Button variant={"outline"} onClick={uploadContacts}>
            Upload
          </Button>
          <Popover>
            <PopoverTrigger className="flex cursor-pointer items-center justify-center rounded-lg bg-blue-500 p-2 text-white shadow-lg transition-colors hover:bg-blue-600">
              <Copy className="h-5 w-5" />
            </PopoverTrigger>
            <PopoverContent>
              {" "}
              <Textarea
                className="h-40 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pega aquí los datos CSV..."
                onChange={handleCSVInput}
                rows={6}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table Container (Scrollable) */}
      <div className="max-h-[calc(100vh-150px)] flex-grow overflow-y-auto rounded-md border pb-8">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-green-500/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-center text-black" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={(index % 2 === 0 && "bg-blue-100/20") || undefined}
                  style={{ textAlign: "center" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns?.length} // add 2 for the index and actions columns
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (Sticky Bottom) */}
      <div className="sticky bottom-0 flex items-center justify-end space-x-2 border-t bg-white py-4">
        <span className="text-xs text-stone-500">
          Pagina {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}{" "}
        </span>
        {/* Rows per page */}

        <div className="flex items-center space-x-1">
          <span className="text-xs">Contactos por pagina:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-md border border-gray-300 p-1 text-xs"
          >
            {[10, 20, 30, 40, 50, 100, 200].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        {/* First Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          Primera
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>

        {/* Page Number Buttons */}
        {Array.from({ length: Math.min(table.getPageCount(), 10) }, (_, i) => {
          const currentPage = table.getState().pagination.pageIndex;
          const totalPages = table.getPageCount();

          let pageNo = i; // Default case for small page numbers

          if (totalPages > 10) {
            if (currentPage > 4 && currentPage < totalPages - 5) {
              pageNo = currentPage - 4 + i;
            } else if (currentPage >= totalPages - 5) {
              pageNo = totalPages - 10 + i;
            }
          }

          // Prevent negative page numbers
          pageNo = Math.max(0, pageNo);

          return (
            <Button
              key={i}
              variant={pageNo === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => table.setPageIndex(pageNo)}
            >
              {pageNo + 1}
            </Button>
          );
        })}
        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          Ultima
        </Button>
      </div>
    </div>
  );
}
