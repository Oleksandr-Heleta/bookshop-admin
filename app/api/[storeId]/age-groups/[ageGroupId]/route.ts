import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { ageGroupId: string } }
) {
  try {
    if (!params.ageGroupId)
      return new NextResponse('ageGroup ID is required', { status: 400 });

    const ageGroup = await prismadb.ageGroup.findUnique({
      where: {
        id: params.ageGroupId,
      },
    });

    return NextResponse.json(ageGroup);
  } catch (error) {
    console.log('[ageGroup_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; ageGroupId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value, description, descriptionSeo, titleSeo } = body;

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });
    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!value) return new NextResponse('Value is required', { status: 400 });
    if (!params.ageGroupId)
      return new NextResponse('ageGroup ID is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const ageGroup = await prismadb.ageGroup.updateMany({
      where: {
        id: params.ageGroupId,
      },
      data: {
        name,
        value,
        description,
        descriptionSeo,
        titleSeo,
      },
    });

    return NextResponse.json(ageGroup);
  } catch (error) {
    console.log('[ageGroup_PACH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; ageGroupId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });

    if (!params.ageGroupId)
      return new NextResponse('ageGroup ID is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const ageGroup = await prismadb.ageGroup.deleteMany({
      where: {
        id: params.ageGroupId,
      },
    });

    return NextResponse.json(ageGroup);
  } catch (error) {
    console.log('ageGroup_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
