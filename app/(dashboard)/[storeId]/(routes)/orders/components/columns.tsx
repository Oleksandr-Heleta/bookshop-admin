"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"


export type OrderColumn = {
  id: string
  name: string
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
    header: "Товари",              
  },
  {
    accessorKey: "name",
    header: "П.І.Б.",              
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
    accessorKey: "orderStatus",
    header: "Стан",
  },
  {
    id: "action",
    cell: ({row}) => <CellAction data={row.original} />
  }
  
]
