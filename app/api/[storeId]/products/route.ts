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
      categories,
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

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }
    if (!categories.length) {
      return new NextResponse("Categories is required", { status: 400 });
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
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        ageGroups: {
          createMany: {
            data: [
              ...ageGroups.map(
                (ageGroup: { value: string; label: string }) => ({
                  ageGroupId: ageGroup.value,
                  ageGroupName: ageGroup.label,
                })
              ),
            ],
          },
        },
        categories: {
          createMany: {
            data: [
              ...categories.map(
                (category: { value: string; label: string }) => ({
                  categoryId: category.value,
                  categoryName: category.label,
                })
              ),
            ],
          },
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
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const ageGroupId = searchParams.get("ageGroupId") || undefined;
    const publishingId = searchParams.get("publishingId") || undefined;
    const isFeatured = searchParams.get("isFeatured") || undefined;
    const name = searchParams.get("name") || undefined;
    const isSale = searchParams.get("isSale") || undefined;
    const isNew = searchParams.get("isNew") || undefined;
    const maxPrice = searchParams.get("maxPrice") || undefined;
    const minPrice = searchParams.get("minPrice") || undefined;

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        // name: name ? {
        //   contains: name,
         
        // } : undefined,
        categories: categoryId
          ? {
              some: {
                id: categoryId,
              },
            }
          : undefined,
        ageGroups: ageGroupId
          ? {
              some: {
                id: ageGroupId,
              },
            }
          : undefined,
        publishingId: publishingId || undefined,
        isFeatured: isFeatured ? isFeatured === "true" : undefined,
        isSale: isSale ? isSale === "true" : undefined,
        isNew: isNew ? isNew === "true" : undefined,
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
        isArchived: false,
      },
      include: {
        images: true,
        categories: true,
        publishing: true,
        ageGroups: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const filteredProducts = name
  ? products.filter(product =>
      product.name.toLowerCase().includes(name.toLowerCase())
    )
  : products;

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
