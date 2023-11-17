"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CollorsColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface CollorClientProps {
  data: CollorsColumn[];
}

export const CollorClient: React.FC<CollorClientProps> = ({data}) => {
const router = useRouter();
const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Collors(${data.length})`}
          description="Manage your collors here."
        />
        <Button onClick={()=> router.push(`/${params.storeId}/collors/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Add New
        </Button>
      </div>
      <Separator/>
      <DataTable searchKey="name" columns={columns} data={data}/>
      <Heading title="API" description="API for Collors"/>
      <Separator/>
      <ApiList entityName="collors" entityIdName="collorId"/>
    </>
  );
};
