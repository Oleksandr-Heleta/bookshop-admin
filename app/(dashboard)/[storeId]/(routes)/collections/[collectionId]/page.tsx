import prismadb from "@/lib/prismadb";
import { CollectionForm } from "./components/collection-form";


const CollectionPage = async ({
  params,
}: {
  params: {
    collectionId: string;
  };
}) => {
const collection = await prismadb.collection.findUnique({
    where: {
        id: params.collectionId
    }
});

  return (
  <div className="flex-col">
    <div className="flex-1 space-y-4 p-8 pt-6">
<CollectionForm initialData={collection}/>
    </div>
  </div>);
};

export default CollectionPage;
