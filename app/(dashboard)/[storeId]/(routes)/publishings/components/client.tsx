'use client';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PublishingsColumn, columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { ApiList } from '@/components/ui/api-list';

interface PublishingClientProps {
  data: PublishingsColumn[];
}

export const PublishingClient: React.FC<PublishingClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const paginate = (
    data: PublishingsColumn[],
    page: number,
    pageSize: number
  ): PublishingsColumn[] => {
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
          title={`Видавництва(${data.length})`}
          description="Керуй видавництвами тут."
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/publishings/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Додати
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        data={data}
        page={page}
        pageSize={pageSize}
      />
      <Heading title="API" description="API для видавництв" />
      <Separator />
      <ApiList entityName="publishings" entityIdName="publishingId" />
    </>
  );
};
