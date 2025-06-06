import {format} from "date-fns"

import prismadb from "@/lib/prismadb";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import { formatter } from "@/lib/utils";

const OrdrersPage = async({params}:{
    params: {
        storeId: string;
    };
}) => {
    const orders = await prismadb.order.findMany({
        where:{
            storeId: params.storeId
        },
        include:{
            orderItems:{
                include: {
                    product: true
                }
            }
        },
        orderBy:{
            createdAt: "desc"
        }
    });

const formattedOrders : OrderColumn[] = orders.map((item) => ({
    id: item.id,
    name: item.name,
    surname: item.surname,
    phone: item.phone,
    call: item.call,
    city: item.city,
    cityId: item.cityId,
    address: item.address,
    addressId: item.addressId,
    products: item.orderItems?.map((orderItem) => orderItem.product ? `${orderItem.product.name} - ${orderItem.quantity}` : 'Товар видалено'),
    totalPrice: formatter.format(Number(item.totalPrice)), 
    orderStatus: item.orderStatus,
    orderState: item.orderState, 
    ttnumber: item.ttnumber || undefined,
    isPaid: item.isPaid,
    post: item.post,
    delivery: item.delivery,
    createdAt: format(item.createdAt, "dd.MM.yyyy"),
}));
  
   
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <OrderClient data={formattedOrders}/>
            </div>
           
        </div>
    );
};

export default OrdrersPage;
