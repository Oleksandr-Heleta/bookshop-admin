import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      description,
      images,
      price,
      quantity,
      categoryId,
      publishingId,
      ageGroups,
      isNew,
      isSale,
      sale,
      isLowQuantity,
      isFeatured,
      isArchived,
      sheets,
      size,
      titleSheet,
      video,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length){
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse("Category Id is required", { status: 400 });
    }
    if (!ageGroups.length) {
      return new NextResponse("ageGroups is required", { status: 400 });
    }
    if (!publishingId) {
      return new NextResponse("publishing Id is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        description,
        price,
        quantity,
        categoryId,
        publishingId,
        isNew,
        isSale,
        sale,
        isLowQuantity,
        isFeatured,
        isArchived,
        sheets,
        size,
        titleSheet,
        video,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [
              ...images.map((image: {url: string})=>image)
            ]
          }
        },
        ageGroups: {
          createMany: {
            data: [ ...ageGroups.map((ageGroup: {value: string; label: string}) => ({ ageGroupId: ageGroup.value , ageGroupName: ageGroup.label}))],
          }
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const {searchParams} = new URL (req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const ageGroupId = searchParams.get('ageGroupId') || undefined;
    const publishingId = searchParams.get('publishingId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        publishingId,
        ageGroups: {
          some: {
            ageGroupId: ageGroupId,
          },
        },
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        publishing: true, 
        // ageGroups: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
