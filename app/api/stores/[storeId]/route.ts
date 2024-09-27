import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      sale,
      mainbillboards,
      description,
      titleSeo,
      descriptionSeo,
    } = body;

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!params.storeId)
      return new NextResponse('Store ID is required', { status: 400 });

    const mainbillboardIds = mainbillboards.map(
      (item: { value: string; lable: string }) => item.value
    );
    const billboards = await prismadb.billboard.findMany({
      where: {
        AND: [{ storeId: params.storeId }, { id: { in: mainbillboardIds } }],
      },
    });

    const store = await prismadb.store.update({
      where: {
        id: params.storeId,
        userId,
      },
      data: {
        name,
        sale,
        description,
        titleSeo,
        descriptionSeo,
        mainbillboards: {
          deleteMany: {},
          createMany: {
            data: [
              ...billboards.map((billboard) => ({
                id: billboard.id,
                imageUrl: billboard.imageUrl,
                label: billboard.label,
              })),
            ],
          },
        },
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    if (!params.storeId)
      return new NextResponse('Store ID is required', { status: 400 });

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
