import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram-chat";

const corsHeaders = {
  "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS () {
  return NextResponse.json({}, { headers: corsHeaders });
};


export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    
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

    // console.log(body);
    
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
          create: orderItems.map((item: { quantity: number, productId: string }) => ({
            quantity: item.quantity,
            product: {
              connect: {
                id: item.productId
              }
            }
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    const updateProductPromises = order.orderItems.map(async (orderItem) => {
      const product = await prismadb.product.update({
        where: { id: orderItem.productId ?? undefined },
        data: {
          quantity: {
            decrement: orderItem.quantity,
          },
        },
      });

      if (product.quantity <= 0) {
        await prismadb.product.update({
          where: { id: orderItem.productId ?? undefined },
          data: {
            isArchived: true,
          },
        });
      }
    });

    await Promise.all(updateProductPromises);

    await sendMessage({name, phone , totalPrice, orderItems, call, payment});

    let linkUrl = `${process.env.FRONTEND_STORE_URL}/cart?success=true`;

    if(payment === "online") {
linkUrl = `https://api.monobank.ua/`}


      return NextResponse.json({url: linkUrl}, { headers: corsHeaders }  ); // 
  } catch (error) {
    console.log("[ORDER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}