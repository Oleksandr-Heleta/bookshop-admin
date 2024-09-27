import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { id, name, value, description, descriptionSeo, titleSeo } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    if (!value) {
      return new NextResponse('Value is required', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const seriaId = await prismadb.seria.findFirst({
      where: {
        id,
      },
    });

    if (seriaId) {
      return new NextResponse('ID is exist', { status: 400 });
    }

    const seria = await prismadb.seria.create({
      data: {
        id,
        name,
        value,
        storeId: params.storeId,
        description,
        descriptionSeo,
        titleSeo,
      },
    });

    return NextResponse.json(seria);
  } catch (error) {
    console.log('[seria_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    const serias = await prismadb.seria.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(serias);
  } catch (error) {
    console.log('[serias_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
