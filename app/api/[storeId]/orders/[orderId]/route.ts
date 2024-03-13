import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Order, OrderItem, Image, Product } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    if (!params.orderId)
      return new NextResponse("Order ID is required", { status: 400 });

    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    let {
      name,
      phone,
      address,
      orderItems,
      orderStatus,
      orderState,
      isPaid,
      totalPrice,
    } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const oldOrder = await prismadb.order.findUnique({
      where: { id: params.orderId },
      include: { orderItems: true },
    });

    if (!oldOrder) {
      throw new Error(`Order with ID ${params.orderId} not found`);
    }

    // Отримання списку нових товарів
    const newProducts = orderItems.map((orderItem: OrderItem) => ({
      id: orderItem.productId,
      quantity: orderItem.quantity,
    }));

    // Отримання списку старих товарів
    const oldProducts = oldOrder.orderItems.map((orderItem) => ({
      id: orderItem.productId,
      quantity: orderItem.quantity,
    }));

    // Отримання списку видалених товарів
    const deletedProducts = oldProducts.filter(
      (oldProduct) =>
        !newProducts.some(
          (newProduct: { id: string; quantity: number }) =>
            newProduct.id === oldProduct.id
        )
    );

    // Оновлення кількості товарів
    await Promise.all(
      newProducts.map(async (newProduct: { id: string; quantity: number }) => {
        const oldProduct = oldProducts.find((p) => p.id === newProduct.id);
        if (oldProduct) {
          // Зменшення кількості
          await prismadb.product.update({
            where: { id: newProduct.id },
            data: {
              quantity: {
                increment: oldProduct.quantity - newProduct.quantity,
              },
            },
          });
        } else {
          // Збільшення кількості, якщо товар відсутній в старому замовленні
          await prismadb.product.update({
            where: { id: newProduct.id },
            data: {
              quantity: {
                decrement: newProduct.quantity,
              },
            },
          });
        }
      })
    );

    // Оновлення кількості видалених товарів
    await Promise.all(
      deletedProducts.map(async (deletedProduct) => {
        await prismadb.product.update({
          where: { id: deletedProduct.id },
          data: {
            quantity: {
              increment: deletedProduct.quantity,
            },
          },
        });
      })
    );


    if (isPaid|| orderState === "paided" || (orderState === "afterrecive" && orderStatus === "sended")) {
      isPaid = true;
    }
    // Оновлення замовлення
    const updatedOrder = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        name,
        phone,
        address,
        orderStatus,
        orderState,
        isPaid,
        totalPrice,
        orderItems: {
          // Видалення старих orderItems та додавання кількості в товари
          deleteMany: {},
          create: orderItems,
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.log("[ORDER_PACH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!params.orderId)
      return new NextResponse("ORDER ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const order = await prismadb.order.findUnique({
      where: { id: params.orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new Error(`Order with ID ${params.orderId} not found`);
    }

    const updateProductPromises = order.orderItems.map(async (orderItem) => {
      await prismadb.product.update({
        where: { id: orderItem.productId },
        data: {
          quantity: {
            increment: orderItem.quantity,
          },
        },
      });
    });

    await prismadb.orderItem.deleteMany({
      where: {
        orderId: params.orderId,
      },
    });

    const deletedOrder = await prismadb.order.delete({
      where: {
        id: params.orderId,
      },
    });

    return NextResponse.json(deletedOrder);
  } catch (error) {
    console.log("[ORDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
