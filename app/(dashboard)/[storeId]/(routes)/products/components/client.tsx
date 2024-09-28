'use client';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ProductColumn, columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { ApiList } from '@/components/ui/api-list';
import { useEffect } from 'react';

interface ProductClientProps {
  data: ProductColumn[];
}

export const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const paginate = (
    data: ProductColumn[],
    page: number,
    pageSize: number
  ): ProductColumn[] => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  useEffect(() => {
    paginate(data, page, pageSize);
    const previousUrl = document.referrer;
    // console.log(previousUrl, page, pageSize);
    if (previousUrl) {
      localStorage.setItem('previousUrl', previousUrl);
    }
  }, [data, page, pageSize]);

  useEffect(() => {}, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Товари(${data.length})`}
          description="Керуй своїми товарами тут."
        />
        <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
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
      <Heading title="API" description="API для товарів" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};
