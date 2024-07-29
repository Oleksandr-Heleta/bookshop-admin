"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { statuses, states } from "@/lib/utils";
import { CheckCircle, Circle  } from 'lucide-react';


export type OrderColumn = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  city: string
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
    cell: ({row})=>{
      return `${row.original.name} ${row.original.surname}`;
     }              
  },
  {
    accessorKey: "phone",
    header: "Телефон",              
  },
  {
    accessorKey: "address",
    header: "Адреса", 
    cell: ({row})=>{
      return `${row.original.city}, ${row.original.address}`;
     }             
  },
  {
    accessorKey: "totalPrice",
    header: "Загальна вартість",              
  },

  {
    accessorKey: "orderState",
    header: "Оплата",
    cell: ({row})=>{
      return <div className="flex gap-2">
          {row.original.isPaid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-red-500" />}
        {states.find(state => state.value === row.original.orderState)?.name}
        </div>
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
