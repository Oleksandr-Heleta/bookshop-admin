"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { BillboardColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface BilboardClientProps {
  data: BillboardColumn[];
}

export const BilboardClient: React.FC<BilboardClientProps> = ({data}) => {
const router = useRouter();
const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Білборди(${data.length})`}
          description="Керуй своїми білбордами тут."
        />
        <Button onClick={()=> router.push(`/${params.storeId}/billboards/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Додати
        </Button>
      </div>
      <Separator/>
      <DataTable searchKey="label" columns={columns} data={data}/>
      <Heading title="API" description="API для білбордів"/>
      <Separator/>
      <ApiList entityName="billboards" entityIdName="billboardId"/>
    </>
  );
};
