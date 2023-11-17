import {format} from "date-fns"

import prismadb from "@/lib/prismadb";
import { CollorClient } from "./components/client";
import { CollorsColumn } from "./components/columns";

const CollorsPage = async({params}:{
    params: {
        storeId: string;
    };
}) => {
    const collors = await prismadb.collor.findMany({
        where:{
            storeId: params.storeId
        },
        orderBy:{
            createdAt: "desc"
        }
    });

    const formattedCollors : CollorsColumn[] = collors.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
  
    
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <CollorClient data={formattedCollors}/>
            </div>
           
        </div>
    );
};

export default CollorsPage;
