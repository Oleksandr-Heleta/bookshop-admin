import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { seriaId: string } }
) {
  try {
    if (!params.seriaId)
      return new NextResponse('Seria ID is required', { status: 400 });

    const seria = await prismadb.seria.findUnique({
      where: {
        id: params.seriaId,
      },
    });

    return NextResponse.json(seria);
  } catch (error) {
    console.log('[SERIA_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; seriaId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value, description, descriptionSeo, titleSeo } = body;

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!value) return new NextResponse('Value is required', { status: 400 });
    if (!params.seriaId)
      return new NextResponse('Seria ID is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const seria = await prismadb.seria.updateMany({
      where: {
        id: params.seriaId,
      },
      data: {
        name,
        value,
        description,
        descriptionSeo,
        titleSeo,
      },
    });

    return NextResponse.json(seria);
  } catch (error) {
    console.log('[SERIA_PACH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; seriaId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });

    if (!params.seriaId)
      return new NextResponse('Seria ID is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const seria = await prismadb.seria.deleteMany({
      where: {
        id: params.seriaId,
      },
    });

    return NextResponse.json(seria);
  } catch (error) {
    console.log('SERIA_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
