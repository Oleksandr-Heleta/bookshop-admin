import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { de } from "date-fns/locale";
import { NextResponse } from "next/server";


export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId)
      return new NextResponse("Product ID is required", { status: 400 });

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        categories: {},
        publishing: {},
        ageGroups: {},
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    let {
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
      video
    } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!images || !images.length) return new NextResponse("Images are required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!quantity) return new NextResponse("Quantity is required", { status: 400 });
    if (!categories.length) return new NextResponse("Categories is required", { status: 400 });
    if (!ageGroups.length) return new NextResponse("ageGroups is required", { status: 400 });
    if (!publishingId) return new NextResponse("publishing Id is required", { status: 400 });
    if (!params.productId) return new NextResponse("Product ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!quantity) {
      isArchived = true;
    }

    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
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
          deleteMany: {},
          createMany: {
            data: images.map((image: { url: string }, index: number) => ({ url: image.url, order: index })),
          },
        },
        ageGroups: {
          deleteMany: {},
          createMany: {
            data: ageGroups.map((ageGroup: { value: string; label: string }) => ({
              ageGroupId: ageGroup.value,
              ageGroupName: ageGroup.label,
            })),
          },
        },
        categories: {
          deleteMany: {},
          createMany: {
            data: categories.map((category: { value: string; label: string }) => ({
              categoryId: category.value,
              categoryName: category.label,
            })),
          },
        },
       
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!params.productId)
      return new NextResponse("Product ID is required", { status: 400 });

    console.log("Fetching store by user ID...");
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    console.log("Deleting images...");
    const images = await prismadb.image.findMany({
      where: {
        productId: params.productId,
      },
    });


    
    const delImages = await Promise.all(images.map(async (image) => {
      await fetch(`https://mouse-admin.com.ua/api/upload`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({filename:  image.url }),
      });
    }))
 
  

    console.log("Deleting categories...");
    const categories = await prismadb.categoriesToProduct.deleteMany({
      where: {
        productId: params.productId,
      },
    });

    console.log("Deleting age groups...");
    const ageGroups = await prismadb.ageGroupToProduct.deleteMany({
      where: {
        productId: params.productId,
      },
    });

    console.log("Updating order items...");
    const orderItems = await prismadb.orderItem.updateMany({
      where: {
        productId: params.productId,
      },
      data: {
        productId: null,
      },
    });

    console.log("Deleting product...");
    const product = await prismadb.product.deleteMany({
      where: {
        id: params.productId,
      },
    });

    console.log("Product deleted successfully");

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}