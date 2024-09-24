'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export type SeriasColumn = {
  id: string;
  name: string;
  value: string;
  createdAt: string;
};

export const columns: ColumnDef<SeriasColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Назва',
  },
  {
    accessorKey: 'value',
    header: 'Значення',
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">{row.original.value}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
  },
  {
    id: 'action',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
