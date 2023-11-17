"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"


export type CollorsColumn = {
  id: string
  name: string
  value: string
  createdAt: string;

}

export const columns: ColumnDef<CollorsColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({row}) =>(
      <div className="flex items-center gap-x-2">
        {row.original.value}
        <div className="w-6 h-6 rounded-full border" style={{backgroundColor: row.original.value}}></div>
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "action",
    cell: ({row}) => <CellAction data={row.original} />
  }
]
