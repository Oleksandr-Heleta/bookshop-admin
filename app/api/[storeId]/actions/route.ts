import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getTotalRevenue } from "@/actions/get_total_revenue";
import { getSalesCount } from "@/actions/get_sales_count";
import { getStockCount } from "@/actions/get_stock_count";
import { getGraphRevenue, GraphData } from "@/actions/get_graph_revenue";
import { getProductSales } from "@/actions/get_product_sales";
import { statPeriodsType } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const url = new URL(req.url);
    const period =
      (url.searchParams.get("period") as statPeriodsType) || undefined;

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }
    const totalRevenue = await getTotalRevenue(params.storeId, period);
    const graphRevenue = await getGraphRevenue(params.storeId, period);
    const salesCount = await getSalesCount(params.storeId, period);
    const stockCount = await getStockCount(params.storeId);
    const productSales = await getProductSales(params.storeId, period);

    const data = {
      totalRevenue,
      graphRevenue,
      salesCount,
      stockCount,
      productSales,
    };
    return NextResponse.json(data);
  } catch (error) {
    console.log("[ACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
