import {format} from "date-fns"

import prismadb from "@/lib/prismadb";
import { PublishingClient } from "./components/client";
import { PublishingsColumn } from "./components/columns";

const PublishingsPage = async({params}:{
    params: {
        storeId: string;
    };
}) => {
    const publishings = await prismadb.publishing.findMany({
        where:{
            storeId: params.storeId
        },
        orderBy:{
            createdAt: "desc"
        }
    });

    const formattedPublishings : PublishingsColumn[] = publishings.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
  
    
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <PublishingClient data={formattedPublishings}/>
            </div>
           
        </div>
    );
};

export default PublishingsPage;
