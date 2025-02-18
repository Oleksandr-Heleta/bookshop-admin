import prismadb from "@/lib/prismadb";
// import { Decimal } from '@prisma/client/runtime';
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram-chat";
import { OrderItem, Product, Image } from "@prisma/client";
import { generateUniqueId } from "@/lib/utils";

interface ProductWithImages extends Product {
  images: Image[];
}

interface ProductWithQuantity {
  quantity: number;
  product: ProductWithImages;
}

async function getOrderItemsWithProductDetails(
  orderItems: OrderItem[]
): Promise<ProductWithQuantity[]> {
  const result: ProductWithQuantity[] = [];

  for (const orderItem of orderItems) {
    const product = await prismadb.product.findUnique({
      where: { id: orderItem.productId ?? undefined },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (product) {
      result.push({
        quantity: orderItem.quantity,
        product,
      });
    }
  }

  return result;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();

    let {
      name,
      surname,
      phone,
      city,
      cityId,
      address,
      addressId,
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
      return new NextResponse("Phone is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!name) {
      return new NextResponse("Name is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!surname) {
      return new NextResponse("Name is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!city) {
      return new NextResponse("City is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!address) {
      return new NextResponse("Address is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!orderItems) {
      return new NextResponse("orderItems is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", {
        status: 403,
        headers: corsHeaders,
      });
    }

    for (const orderItem of orderItems) {
      const product = await prismadb.product.findUnique({
        where: { id: orderItem.productId },
      });

      if (!product) {
        return new NextResponse(
          JSON.stringify({
            message: `Product with ID ${orderItem.productId} not found`,
            productId: orderItem.productId,
          }),
          { status: 404, headers: corsHeaders }
        );
      }

      if (product.isArchived) {
        return new NextResponse(
          JSON.stringify({
            message: `Product with ID ${orderItem.productId} is archived`,
            productId: orderItem.productId,
          }),
          { status: 410, headers: corsHeaders }
        );
      }

      if (product.quantity < orderItem.quantity) {
        return new NextResponse(
          JSON.stringify({
            message: `Insufficient quantity for product with ID ${orderItem.productId}`,
            productId: orderItem.productId,
          }),
          { status: 409, headers: corsHeaders }
        );
      }
    }

    const sale = storeByUserId.sale;

    if (isPaid || (payment === "afterrecive" && orderStatus === "sended")) {
      isPaid = true;
    }

    const id = await generateUniqueId("order");

    const order = await prismadb.order.create({
      data: {
        id,
        name,
        surname,
        phone,
        city,
        cityId,
        address,
        addressId,
        orderStatus,
        orderState: payment,
        call,
        post,
        delivery,
        createdBy: "BYSITE",
        isPaid,
        totalPrice,
        storeId: params.storeId,
        orderItems: {
          create: orderItems.map(
            (item: { quantity: number; productId: string }) => ({
              quantity: item.quantity,
              product: {
                connect: {
                  id: item.productId,
                },
              },
            })
          ),
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
      if (product.quantity > 0 && product.quantity < 3) {
        await prismadb.product.update({
          where: { id: orderItem.productId ?? undefined },
          data: {
            isLowQuantity: true,
          },
        });
      }
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

    await sendMessage({
      name,
      surname,
      phone,
      totalPrice,
      orderItems,
      call,
      payment,
    });

    let linkUrl = `${process.env.FRONTEND_STORE_URL}/order-confirm?orderId=${order.id}`;

    if (payment === "online") {
      if (!process.env.MONOBANK_API_TOKEN) {
        throw new Error("MONOBANK_API_TOKEN is not defined");
      }

      const orderItemsWithProductDetails =
        await getOrderItemsWithProductDetails(order.orderItems);

      const bascetOrder = orderItemsWithProductDetails.map(
        (item: ProductWithQuantity) => {
          const discount = [];
          if (sale > 0 || item.product.isSale) {
            const percent = item.product.isSale ? item.product.sale : sale;
            discount.push({
              type: "DISCOUNT",
              mode: "PERCENT",
              value: percent,
            });
          }
          const price = item.product.price.toNumber(); // Перетворення ціни в число
          const sum = price * 100; // Виконання арифметичної операції
          // console.log(discount);
          return {
            name: item.product.name,
            qty: item.quantity,
            sum: sum,
            icon: item.product.images[0].url,
            code: item.product.id,
            unit: "шт.",
            discounts: discount,
          };
        }
      );

      // console.log(bascetOrder);
      // Створення інвойсу в Monobank
      const response = await fetch(
        "https://api.monobank.ua/api/merchant/invoice/create",
        {
          method: "POST",
          headers: {
            "X-Token": process.env.MONOBANK_API_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice * 100, // сума в копійках
            ccy: 980, // код валюти (UAH)
            merchantPaymInfo: {
              reference: order.id,
              destination: "Оплата замовлення",
              comment: order.id,
              customerEmails: ["peterone051@gmail.com"],
              basketOrder: bascetOrder,
            },
            redirectUrl: `${process.env.FRONTEND_STORE_URL}/order-confirm?orderId=${order.id}`,
            webhookUrl: `${process.env.NEXT_PUBLIC_API_URL}/webhook`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create invoice: ${response.statusText}`);
      }

      const invoiceData = await response.json();
      linkUrl = invoiceData.pageUrl;
    }

    return NextResponse.json({ url: linkUrl }, { headers: corsHeaders }); //
  } catch (error) {
    console.log("[ORDER_POST]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
