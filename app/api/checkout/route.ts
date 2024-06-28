import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

   let {
    name,
    phone,
    address,
    orderStatus,
    payment,
    call,
    post,
    delivery,
    isPaid,
    totalPrice,
    orderItems,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!phone) {
      return new NextResponse("Phone is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!address) {
      return new NextResponse("Address is required", { status: 400 });
    }

    if (!orderItems) {
      return new NextResponse("orderItems is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (isPaid || (payment === "afterrecive" && orderStatus === "sended")) {
      isPaid = true;
    }
    const order = await prismadb.order.create({
      data: {
        name,
        phone,
        address,
        orderStatus,
        orderState: payment,
        call,
        post,
        delivery,
        isPaid,
        totalPrice,
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
        where: { id: orderItem.productId ?? undefined },
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