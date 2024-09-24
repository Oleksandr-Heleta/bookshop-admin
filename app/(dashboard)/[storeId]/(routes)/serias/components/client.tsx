'use client';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SeriasColumn, columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { ApiList } from '@/components/ui/api-list';

interface SeriasClientProps {
  data: SeriasColumn[];
}

export const SeriasClient: React.FC<SeriasClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const paginate = (
    data: SeriasColumn[],
    page: number,
    pageSize: number
  ): SeriasColumn[] => {
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
          title={`Серії(${data.length})`}
          description="Керуй серіями тут."
        />
        <Button onClick={() => router.push(`/${params.storeId}/serias/new`)}>
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
      <Heading title="API" description="API для Серій" />
      <Separator />
      <ApiList entityName="serias" entityIdName="seriaId" />
    </>
  );
};
