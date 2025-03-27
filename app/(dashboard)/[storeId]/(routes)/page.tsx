import { DashboardClient } from "./_client_page/client";
import { getTotalRevenue } from "@/actions/get_total_revenue";
import { getSalesCount } from "@/actions/get_sales_count";
import { getStockCount } from "@/actions/get_stock_count";
import { getGraphRevenue } from "@/actions/get_graph_revenue";
import { getProductSales } from "@/actions/get_product_sales";

interface DashboardPageProps {
  params: {
    storeId: string;
  };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  return <DashboardClient />;
};

export default DashboardPage;
