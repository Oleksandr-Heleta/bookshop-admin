'use client';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AgeGroupColumn, columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { ApiList } from '@/components/ui/api-list';
import { useEffect } from 'react';

interface AgeGroupClientProps {
  data: AgeGroupColumn[];
}

export const AgeGroupClient: React.FC<AgeGroupClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const paginate = (
    data: AgeGroupColumn[],
    page: number,
    pageSize: number
  ): AgeGroupColumn[] => {
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
          title={`Вікові групи(${data.length})`}
          description="Керуй віковими групами тут."
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/age-groups/new`)}
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
      <Heading title="API" description="API для вікових груп" />
      <Separator />
      <ApiList entityName="age-groups" entityIdName="ageGroupId" />
    </>
  );
};
