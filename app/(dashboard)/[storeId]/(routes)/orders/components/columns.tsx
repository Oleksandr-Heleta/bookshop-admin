"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"


export type OrderColumn = {
  id: string
  phone: string
  address: string
  isPaid: boolean
  totalPrice: string
  products: string
  createdAt: string;

}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Продукти",              
  },
  {
    accessorKey: "phone",
    header: "Телефон",              
  },
  {
    accessorKey: "address",
    header: "Адреса",              
  },
  {
    accessorKey: "totalPrice",
    header: "Загальна вартість",              
  },

  {
    accessorKey: "isPaid",
    header: "Стан",
  },
  {
    id: "action",
    cell: ({row}) => <CellAction data={row.original} />
  }
  
]
