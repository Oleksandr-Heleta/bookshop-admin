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

    const publishingId = await prismadb.publishing.findFirst({
      where: {
        id,
      },
    });

    if (publishingId) {
      return new NextResponse('ID is exist', { status: 400 });
    }

    const publishing = await prismadb.publishing.create({
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

    return NextResponse.json(publishing);
  } catch (error) {
    console.log('[publishing_POST]', error);
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

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const ageGroupId = searchParams.get('ageGroupId') || undefined;

    const publishings = await prismadb.publishing.findMany({
      where: {
        storeId: params.storeId,
        products: {
          some: {
              ...(categoryId && {
                categories: {
                  some: {
                    categoryId: categoryId,
                  },
                },
              }),
              ...(ageGroupId && {
                ageGroups: {
                  some: {
                    ageGroupId: ageGroupId,
                  },
                },
              }),
            },
          },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(publishings);
  } catch (error) {
    console.log('[PUBLISHINGS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
