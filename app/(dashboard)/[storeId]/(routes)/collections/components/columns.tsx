"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"


export type CollectionColumn = {
  id: string
  name: string
  value: string
  createdAt: string;

}

export const columns: ColumnDef<CollectionColumn>[] = [
  {
    accessorKey: "name",
    header: "Назва",
  },
  {
    accessorKey: "value",
    header: "Значення",
  },
  {
    accessorKey: "createdAt",
    header: "Дата",
  },
  {
    id: "action",
    cell: ({row}) => <CellAction data={row.original} />
  }
]
