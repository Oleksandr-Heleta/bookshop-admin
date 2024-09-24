import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { publishingId: string } }
) {
  try {
    if (!params.publishingId)
      return new NextResponse('publishing ID is required', { status: 400 });

    const publishing = await prismadb.publishing.findUnique({
      where: {
        id: params.publishingId,
      },
    });

    return NextResponse.json(publishing);
  } catch (error) {
    console.log('[PUBLISHING_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; publishingId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value, description, descriptionSeo, titleSeo } = body;

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!value) return new NextResponse('Value is required', { status: 400 });
    if (!params.publishingId)
      return new NextResponse('publishing ID is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const publishing = await prismadb.publishing.updateMany({
      where: {
        id: params.publishingId,
      },
      data: {
        name,
        value,
        description,
        descriptionSeo,
        titleSeo,
      },
    });

    return NextResponse.json(publishing);
  } catch (error) {
    console.log('[publishing_PACH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; publishingId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });

    if (!params.publishingId)
      return new NextResponse('publishing ID is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const publishing = await prismadb.publishing.deleteMany({
      where: {
        id: params.publishingId,
      },
    });

    return NextResponse.json(publishing);
  } catch (error) {
    console.log('publishing_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
