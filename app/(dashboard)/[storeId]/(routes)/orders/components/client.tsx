"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { OrderColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
 
  const router = useRouter();
const params = useParams();

  return (
    <>
     <div className="flex items-center justify-between">
      <Heading
        title={`Замовлення(${data.length})`}
        description="Керуй замовленнями тут."
      />
       <Button onClick={()=> router.push(`/${params.storeId}/orders/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Додати
        </Button>
        </div>
      <Separator />
      <DataTable searchKey="products" columns={columns} data={data} />
    </>
  );
};
