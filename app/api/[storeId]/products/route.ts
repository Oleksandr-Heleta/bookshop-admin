import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { generateUniqueId } from "@/lib/utils";

const corsHeaders = {
  "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      author,
      description,
      images,
      price,
      quantity,
      categories,
      publishingId,
      ageGroups,
      seriaId,
      suggestionProducts,
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
      isbn,
      titleSeo,
      descriptionSeo,
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

    const id = await generateUniqueId("product");

    const product = await prismadb.product.create({
      data: {
        id,
        name,
        author,
        description,
        price,
        quantity,
        publishingId,
        seriaId,
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
        isbn,
        titleSeo,
        descriptionSeo,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }, index: number) => ({
                url: image.url,
                order: index,
              })),
            ],
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
        suggestionProducts: {
          connect: suggestionProducts.map(
            (suggestionProduct: { value: string }) => ({
              id: suggestionProduct.value,
            })
          ),
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
    // console.log(searchParams);
    const categoryId = searchParams.get("categoryId") || undefined;
    const ageGroupId = searchParams.get("ageGroupId") || undefined;
    const publishingId = searchParams.get("publishingId") || undefined;
    const isFeatured = searchParams.get("isFeatured") || undefined;
    const name = searchParams.get("name") || undefined;
    const isSale = searchParams.get("isSale") || undefined;
    const isNew = searchParams.get("isNew") || undefined;
    const maxPrice = searchParams.get("maxPrice") || undefined;
    const minPrice = searchParams.get("minPrice") || undefined;
    const seriaId = searchParams.get("seriaId") || undefined;

    const categories = searchParams.getAll("categories");
    const ageGroups = searchParams.getAll("ageGroups");
    const publishings = searchParams.getAll("publishings");

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categories: categories.length
          ? {
              some: {
                categoryId: {
                  in: categories,
                },
              },
            }
          : categoryId
          ? {
              some: {
                categoryId: categoryId,
              },
            }
          : undefined,
        ageGroups: ageGroups.length
          ? {
              some: {
                ageGroupId: {
                  in: ageGroups,
                },
              },
            }
          : ageGroupId
          ? {
              some: {
                ageGroupId: ageGroupId,
              },
            }
          : undefined,
        publishingId: publishings.length
          ? {
              in: publishings,
            }
          : publishingId || undefined,
        seriaId: seriaId || undefined,
        isFeatured: isFeatured ? isFeatured === "true" : undefined,
        isSale: isSale ? isSale === "true" : undefined,
        isNew: isNew ? isNew === "true" : undefined,
        price: {
          ...(minPrice &&
            !isNaN(parseFloat(minPrice)) && { gte: parseFloat(minPrice) }),
          ...(maxPrice &&
            !isNaN(parseFloat(maxPrice)) && { lte: parseFloat(maxPrice) }),
        },
        isArchived: false,
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        categories: {
          orderBy: {
            categoryName: "asc",
          },
        },
        publishing: true,
        seria: true,
        ageGroups: {
          orderBy: {
            ageGroupName: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const filteredProducts = name
      ? products.filter((product) =>
          product.name.toLowerCase().includes(name.toLowerCase())
        )
      : products;

    // console.log(filteredProducts);
    return NextResponse.json(
      { data: filteredProducts },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
