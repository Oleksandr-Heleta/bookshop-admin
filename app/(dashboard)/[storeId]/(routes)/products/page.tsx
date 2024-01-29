import {format} from "date-fns"

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { ProductClient } from "./components/client";
import { ProductColumn } from "./components/columns";

const ProductsPage = async({params}:{
    params: {
        storeId: string;
    };
}) => {
    const products = await prismadb.product.findMany({
        where:{
            storeId: params.storeId
        },
        include:{
            category: true,
            collection: true,
            publishing: true,
        },
        orderBy:{
            createdAt: "desc"
        }
    });

    const formattedProducts : ProductColumn[] = products.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        isSale: item.isSale,
        isNew: item.isNew,
        isFeatured: item.isFeatured,
        isArchived: item.isArchived,
        price: formatter.format(item.price.toNumber()),
        category: item.category.name,
        collection: item.collection.name,
        publishing: item.publishing.value,
        createdAt: format(item.createdAt, "do MMMM  yyyy"),
    }));
  
    
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <ProductClient data={formattedProducts}/>
            </div>
           
        </div>
    );
};

export default ProductsPage;
