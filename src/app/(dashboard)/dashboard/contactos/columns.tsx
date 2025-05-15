"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ArrowUpDown, MoreHorizontal, Plus, Trash, X } from "lucide-react";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  name: string;
  phone: number;
  tags: string[];
  created_at: string;
  index: number;
  id: string;
};

const tagFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const tags = row.getValue(columnId) as string[]; // Ensure it's an array
  if (!Array.isArray(tags)) return false; // Safeguard
  return tags.some((tag) =>
    tag.toLowerCase().includes(filterValue.toLowerCase()),
  );
};

const formatPhoneNumber = (phone: string) => {
  if (!phone || phone.length !== 13) return phone; // Return as is if not valid length

  return `+${phone.slice(0, 2)} ${phone.slice(2, 3)} (${phone.slice(3, 6)}) - ${phone.slice(6, 9)} - ${phone.slice(9)}`;
};

export const getColumns = (
  onAddTag: (rowId: number) => void,
  removeTag: (rowId: number, tag: string) => void,
  onDeleteContact: (rowId: number) => void,
): ColumnDef<any>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "index",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },

    cell: ({ row }) => (
      <div className="cursor-pointer" onClick={() => row.toggleSelected()}>
        {row.getValue("index")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Telefono
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => {
      const formattedPhone = formatPhoneNumber(row.getValue("phone"));
      return <div>{formattedPhone}</div>;
    },
  },
  {
    accessorKey: "lada",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lada
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  {
    accessorKey: "tags",
    header: () => (
      <div
        style={{
          width: "350px",

          textAlign: "left",
        }}
      >
        Etiquetas
      </div>
    ),
    filterFn: tagFilter,
    cell: (info) => {
      const rowId = info.row.original.index;
      return (
        <div
          style={{ maxWidth: "350px", overflow: "auto" }}
          className="group relative flex items-center justify-start gap-2 whitespace-nowrap"
        >
          <button
            className="ml-2 hidden h-5 w-5 items-center justify-center rounded-full bg-gray-200 transition-opacity duration-200 ease-in-out hover:bg-gray-300 group-hover:flex"
            onClick={() => onAddTag(rowId)}
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </button>
          <span> </span>
          {info.row.original.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-500"
            >
              {tag}
              <X
                className="ml-2 h-4 w-4 cursor-pointer text-blue-500 transition-opacity duration-200 ease-in-out hover:text-red-500"
                onClick={() => removeTag(rowId, tag)}
              />
            </span>
          ))}

          {/* Add button (Hidden by default, shown on hover) */}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de creacion
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => {
      const date = new Date(info.getValue());
      const months = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    },
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          className="w-full"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },

    cell: ({ row }) => (
      <div
        className="cursor-pointer"
        onClick={() => navigator.clipboard.writeText(row.getValue("id"))}
      >
        {row.getValue("id")}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const rowId = row.original.index;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDeleteContact(rowId)}
              className="cursor-pointer focus:bg-destructive/90 focus:text-white"
            >
              Eliminar contacto <Trash className="mr-2 h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
