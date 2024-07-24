import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


const corsHeaders = {
  "Access-Control-Allow-Origin": `http://localhost:3001`,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS () {
  return NextResponse.json({}, { headers: corsHeaders });
};

export async function GET(
    req: Request,
  { params }: { params: { storeId: string } }
) {
    try {
          
  
      if (!params.storeId) { 
        return new NextResponse("Store ID is required", { status: 400 });
      }
  
      const store = await prismadb.store.findUnique({
        where: {
          id: params.storeId,
        },
        select: {
          id: true,
          name: true,
          sale: true,
        },
      });

        // console.log(store);

        const mainbillboards = await prismadb.mainBillboard.findMany({
            where: {
                storeId: params.storeId,
            }
        });
        // console.log(mainbillboards);
  
       const data = {
        id: store?.id,
        name: store?.name,
        sale: store?.sale,
        mainbillboards: mainbillboards
       }

      //  console.log(data);
  
      return NextResponse.json({data}, { headers: corsHeaders }  );
    } catch (error) {
      console.log("[STORE_INFO_GET]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }