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

    const { id, name, billboardId, description, descriptionSeo, titleSeo } =
      body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse('Billboard Id is required', { status: 400 });
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

    const categoryId = await prismadb.category.findFirst({
      where: {
        id,
      },
    });

    if (categoryId) {
      return new NextResponse('ID is exist', { status: 400 });
    }

    const category = await prismadb.category.create({
      data: {
        id,
        name,
        billboardId,
        storeId: params.storeId,
        description,
        descriptionSeo,
        titleSeo,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log('[CATEGORIES_POST]', error);
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
    const ageGroupId = searchParams.get('ageGroupId') || undefined;
    const publishingId = searchParams.get('publishingId') || undefined;

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId,
        products: {
          some: {
            product: {
              ...(ageGroupId && {
                ageGroups: {
                  some: {
                    ageGroupId: ageGroupId,
                  },
                },
              }),
              ...(publishingId && {
                publishingId: publishingId,
              }),
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.log('[CATEGORIES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
