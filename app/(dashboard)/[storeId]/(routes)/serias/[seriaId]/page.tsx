import prismadb from '@/lib/prismadb';
import { SeriaForm } from './components/seria-form';

const SeriaPage = async ({
  params,
}: {
  params: {
    seriaId: string;
  };
}) => {
  const seria = await prismadb.seria.findUnique({
    where: {
      id: params.seriaId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SeriaForm initialData={seria} />
      </div>
    </div>
  );
};

export default SeriaPage;
