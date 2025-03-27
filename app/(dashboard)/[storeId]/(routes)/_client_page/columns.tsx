"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ProductColumn = {
  id: string;
  name: string;
  quantity: number;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Назва",
    cell: ({ row }) => {
      return (
        <div className="flex items-start gap-x-2">
          <div>{row.original.name}</div>
        </div>
      );
    },
  },

  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Кількість
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-start gap-x-2">
          {row.original.quantity}
        </div>
      );
    },
  },
];
