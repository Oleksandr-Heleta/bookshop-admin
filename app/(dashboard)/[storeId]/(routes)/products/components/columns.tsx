"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { CheckCircle, Circle  } from 'lucide-react';

export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  category: string;
  collection: string;
  publishing: string;
  isSale: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Назва",
  },
  {
    accessorKey: "isSale",
    header: "Статус",
    cell: ({row}) =>{
      return (<div  className="flex flex-col items-center gap-x-2">
        {row.original.isNew && <div className="bg-red-700 rounded-2xl text-white px-2 text-[8px]">НОВИНКА</div> }
        {row.original.isSale && <div className="bg-orange-500 rounded-2xl text-white px-2 text-[8px]">АКЦІЯ</div>}
      </div>);
     
    },
  },
  {
    accessorKey: "isFeatured",
    header: "Просувати",
    cell: ({row}) =>{
      if (row.original.isFeatured){
        return <CheckCircle className="mr-2 h-4 w-4 text-black" /> ;
      }
      return <Circle className="mr-2 h-4 w-4 text-black" /> ;
    },
  },
  {
    accessorKey: "price",
    header: "Ціна",
  },
  {
    accessorKey: "quantity",
    header: "Кількість",
  },
  {
    accessorKey: "category",
    header: "Категорія",
  },
  {
    accessorKey: "collection",
    header: "Збірка",
  },
  {
    accessorKey: "publishing",
    header: "Видавництво",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.publishing}
       
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Дата",
  },
  {
    id: "action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
