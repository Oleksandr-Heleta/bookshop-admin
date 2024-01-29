"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"


export type CategoryColumn = {
  id: string
  name: string
  billboardLabel: string
  createdAt: string;

}

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Назва",
  },
  {
    accessorKey: "billboard",
    header: "Білборди",
    cell: ({row}) => row.original.billboardLabel,
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
