import {format} from "date-fns"

import prismadb from "@/lib/prismadb";
import { AgeGroupClient } from "./components/client";
import { AgeGroupColumn } from "./components/columns";

const AgeGroupsPage = async({params}:{
    params: {
        storeId: string;
    };
}) => {
    const ageGroups = await prismadb.ageGroup.findMany({
        where:{
            storeId: params.storeId
        },
        orderBy:{
            createdAt: "desc"
        }
    });

    const formattedAgeGroups : AgeGroupColumn[] = ageGroups.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
  
    
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <AgeGroupClient data={formattedAgeGroups}/>
            </div>
           
        </div>
    );
};

export default AgeGroupsPage;
