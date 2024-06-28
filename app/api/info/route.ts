import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function GET(
    req: Request,
  { params }: { params: { storeId: string } }
) {
    try {
      const { userId } = auth();
      const body = await req.json();
  
     
  
      if (!userId) {
        return new NextResponse("Unautorized", { status: 401 });
      }
  
        const store = await prismadb.store.findUnique({
            where:{
                userId,
                id: params.storeId,
            }
        });

        const mainbillboards = await prismadb.mainBillboard.findMany({
            where: {
                storeId: params.storeId,
            }
        });
  
       const data = {
        id: store?.id,
        name: store?.name,
        sale: store?.sale,
        mainbillboards: mainbillboards
       }
  
      return NextResponse.json(data);
    } catch (error) {
      console.log("[STORE_POST]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }