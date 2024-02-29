"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { statuses, states } from "@/lib/utils";


export type OrderColumn = {
  id: string;
  name: string;
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string[];
  orderStatus: string;
  orderState: string;
  createdAt: string;

}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Товари",
    cell: ({row})=>{
        return row.original.products.map((i,index)=>{return <div key={index}>{i}</div>;})   }  
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
    accessorKey: "orderState",
    header: "Стан",
    cell: ({row})=>{
      return states.find(state => state.value === row.original.orderState)?.name;
     }
  },
  {
   accessorKey: "orderStatus",
   header: "Стаус",
   cell: ({row})=>{
    return statuses.find(stat => stat.value === row.original.orderStatus)?.name;
   }
  },
  {
    id: "action",
    cell: ({row}) => <CellAction data={row.original} />
  }
  
]
