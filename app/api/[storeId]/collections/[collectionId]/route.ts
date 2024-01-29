import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { collectionId: string} }
  ) {
    try {
    
      if(!params.collectionId) return new NextResponse("collection ID is required", { status: 400 });

      const collection = await prismadb.collection.findUnique({
          where: {
              id: params.collectionId,
          },
        
      })
  
      return  NextResponse.json(collection);
  
    } catch (error) {
      console.log("[collection_GET]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  };


export async function PATCH(
  req: Request,
  { params }: { params: {storeId: string, collectionId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {name, value} = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });
    if(!params.collectionId) return new NextResponse("collection ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
        where:{
            id: params.storeId,
            userId
        }
    });

    if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }

    const collection = await prismadb.collection.updateMany({
        where: {
            id: params.collectionId,
        },
        data: {
            name,
            value
        }
    })

    return  NextResponse.json(collection);

  } catch (error) {
    console.log("[collection_PACH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, collectionId: string} }
  ) {
    try {
      const { userId } = auth();
        
      if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
   
      if(!params.collectionId) return new NextResponse("collection ID is required", { status: 400 });

      const storeByUserId = await prismadb.store.findFirst({
        where:{
            id: params.storeId,
            userId
        }
    });

    if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
  
      const collection = await prismadb.collection.deleteMany({
          where: {
              id: params.collectionId,
          },
        
      })
  
      return  NextResponse.json(collection);
  
    } catch (error) {
      console.log("collection_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  };
