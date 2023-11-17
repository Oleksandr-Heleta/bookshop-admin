import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { collorId: string} }
  ) {
    try {
    
      if(!params.collorId) return new NextResponse("Collor ID is required", { status: 400 });

      const collor = await prismadb.collor.findUnique({
          where: {
              id: params.collorId,
          },
        
      })
  
      return  NextResponse.json(collor);
  
    } catch (error) {
      console.log("[COLLOR_GET]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  };


export async function PATCH(
  req: Request,
  { params }: { params: {storeId: string, collorId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {name, value} = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });
    if(!params.collorId) return new NextResponse("Collor ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
        where:{
            id: params.storeId,
            userId
        }
    });

    if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }

    const collor = await prismadb.collor.updateMany({
        where: {
            id: params.collorId,
        },
        data: {
            name,
            value
        }
    })

    return  NextResponse.json(collor);

  } catch (error) {
    console.log("[COLLOR_PACH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, collorId: string} }
  ) {
    try {
      const { userId } = auth();
        
      if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
   
      if(!params.collorId) return new NextResponse("Collor ID is required", { status: 400 });

      const storeByUserId = await prismadb.store.findFirst({
        where:{
            id: params.storeId,
            userId
        }
    });

    if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
  
      const collor = await prismadb.collor.deleteMany({
          where: {
              id: params.collorId,
          },
        
      })
  
      return  NextResponse.json(collor);
  
    } catch (error) {
      console.log("COLLOR_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  };
