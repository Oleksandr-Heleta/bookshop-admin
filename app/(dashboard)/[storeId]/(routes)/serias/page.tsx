import { format } from 'date-fns';

import prismadb from '@/lib/prismadb';
import { SeriasClient } from './components/client';
import { SeriasColumn } from './components/columns';

const SeriasPage = async ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  const serias = await prismadb.seria.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedSerias: SeriasColumn[] = serias.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SeriasClient data={formattedSerias} />
      </div>
    </div>
  );
};

export default SeriasPage;
