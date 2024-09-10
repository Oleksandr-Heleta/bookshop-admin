import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { sendMessage } from '@/lib/telegram-chat';
import { OrderItem } from '@prisma/client';

const corsHeaders = {
  'Access-Control-Allow-Origin': `${process.env.FRONTEND_STORE_URL}`,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
      return new NextResponse('Phone is required', { status: 400 });
    }

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    if (!surname) {
      return new NextResponse('Name is required', { status: 400 });
    }

    if (!city) {
      return new NextResponse('City is required', { status: 400 });
    }

    if (!address) {
      return new NextResponse('Address is required', { status: 400 });
    }

    if (!orderItems) {
      return new NextResponse('orderItems is required', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    if (isPaid || (payment === 'afterrecive' && orderStatus === 'sended')) {
      isPaid = true;
    }
    const order = await prismadb.order.create({
      data: {
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

    let linkUrl = `${process.env.FRONTEND_STORE_URL}/cart?success=true`;

    if (payment === 'online') {
      if (!process.env.MONOBANK_API_TOKEN) {
        throw new Error('MONOBANK_API_TOKEN is not defined');
      }
      // Створення інвойсу в Monobank
      const response = await fetch(
        'https://api.monobank.ua/api/merchant/invoice/create',
        {
          method: 'POST',
          headers: {
            'X-Token': process.env.MONOBANK_API_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: totalPrice * 100, // сума в копійках
            ccy: 980, // код валюти (UAH)
            merchantPaymInfo: {
              reference: order.id,
              destination: 'Оплата замовлення',
              comment: `${orderItems
                .map((item: { product: { name: string } }) => item.product.name)
                .join(', ')}`,
            },
            redirectUrl: `${process.env.FRONTEND_STORE_URL}/cart?success=true`,
            webhookUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/webhook`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const invoiceData = await response.json();
      linkUrl = invoiceData.pageUrl;
    }

    return NextResponse.json({ url: linkUrl }, { headers: corsHeaders }); //
  } catch (error) {
    console.log('[ORDER_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
