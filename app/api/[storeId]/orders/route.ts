import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
     {params} : {params: {storeId: string}}
     ) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {name, phone, address, orderItems, orderStatus, isPaid} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if(!phone){
        return new NextResponse("Phone is required", { status: 400 });
    }

    if(!name){
      return new NextResponse("Name is required", { status: 400 });
  }

  if(!address){
    return new NextResponse("Address is required", { status: 400 });
}


    if(!orderItems){
        return new NextResponse("orderItems is required", { status: 400 });
    }

    if(!params.storeId){
        return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
        where:{
            id: params.storeId,
            userId
        }
    });

    if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }

      const order = await prismadb.order.create({
        data: {
          name,
          phone,
          address,
          orderStatus, 
          isPaid,
          storeId: params.storeId,
          orderItems: {
            create: orderItems, 
          },
        },
        include: {
          orderItems: true, 
        },
      });

      const updateProductPromises = order.orderItems.map(async (orderItem) => {
        await prismadb.product.update({
          where: { id: orderItem.productId },
          data: {
            quantity: {
              decrement: orderItem.quantity, 
            },
          },
        });
      });
  
      await Promise.all(updateProductPromises);

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const {searchParams} = new URL (req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const collectionId = searchParams.get('collectionId') || undefined;
    const publishingId = searchParams.get('publishingId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
       
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}