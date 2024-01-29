"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { PublishingsColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface PublishingClientProps {
  data: PublishingsColumn[];
}

export const PublishingClient: React.FC<PublishingClientProps> = ({data}) => {
const router = useRouter();
const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Видавництва(${data.length})`}
          description="Керуй видавництвами тут."
        />
        <Button onClick={()=> router.push(`/${params.storeId}/publishings/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Додати
        </Button>
      </div>
      <Separator/>
      <DataTable searchKey="name" columns={columns} data={data}/>
      <Heading title="API" description="API для видавництв"/>
      <Separator/>
      <ApiList entityName="publishings" entityIdName="publishingId"/>
    </>
  );
};
