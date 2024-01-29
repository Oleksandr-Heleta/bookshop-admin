import {format} from "date-fns"

import prismadb from "@/lib/prismadb";
import { CollectionClient } from "./components/client";
import { CollectionColumn } from "./components/columns";

const CollectionsPage = async({params}:{
    params: {
        storeId: string;
    };
}) => {
    const collections = await prismadb.collection.findMany({
        where:{
            storeId: params.storeId
        },
        orderBy:{
            createdAt: "desc"
        }
    });

    const formattedcollections : CollectionColumn[] = collections.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
  
    
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <CollectionClient data={formattedcollections}/>
            </div>
           
        </div>
    );
};

export default CollectionsPage;
