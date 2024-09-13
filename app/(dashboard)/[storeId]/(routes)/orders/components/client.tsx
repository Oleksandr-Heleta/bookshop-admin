'use client';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { OrderColumn, columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const paginate = (
    data: OrderColumn[],
    page: number,
    pageSize: number
  ): OrderColumn[] => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  useEffect(() => {
    paginate(data, page, pageSize);
  }, [data, page, pageSize]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Замовлення(${data.length})`}
          description="Керуй замовленнями тут."
        />
        <Button onClick={() => router.push(`/${params.storeId}/orders/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Додати
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="phone"
        columns={columns}
        data={data}
        page={page}
        pageSize={pageSize}
      />
    </>
  );
};
