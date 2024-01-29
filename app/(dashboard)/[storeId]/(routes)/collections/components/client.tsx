"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CollectionColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface CollectionClientProps {
  data: CollectionColumn[];
}

export const CollectionClient: React.FC<CollectionClientProps> = ({data}) => {
const router = useRouter();
const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Збірки(${data.length})`}
          description="Керуй своїми збірками тут."
        />
        <Button onClick={()=> router.push(`/${params.storeId}/collections/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Додати
        </Button>
      </div>
      <Separator/>
      <DataTable searchKey="name" columns={columns} data={data}/>
      <Heading title="API" description="API для збірок"/>
      <Separator/>
      <ApiList entityName="collections" entityIdName="collectionId"/>
    </>
  );
};
