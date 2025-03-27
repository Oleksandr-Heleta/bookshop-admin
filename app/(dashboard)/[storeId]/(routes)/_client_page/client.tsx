"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { formatter, statPeriodsType } from "@/lib/utils";
import { CreditCard, DollarSign, Package } from "lucide-react";
import { Overview } from "@/components/overview";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { statPeriods } from "@/lib/utils";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { GraphData } from "@/actions/get_graph_revenue";
import { ProductColumn, columns } from "./columns";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface DashboardClientProps {
  totalRevenueAll: { higherPeriodTotalRevenue: number; totalRevenue: number };
  salesCountAll: { higherPeriodSalesCount: number; salesCount: number };
  stockCountAll: number;
  graphRevenueAll: GraphData[];
  productSalesAll: { id: string; name: string; quantity: number }[];
}

export const DashboardClient = ({}) => {
  const router = useRouter();
  const param = useParams();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<statPeriodsType>("all");
  const [totalRevenue, setTotalRevenue] = useState({
    higherPeriodTotalRevenue: 0,
    totalRevenue: 0,
  });
  const [salesCount, setSalesCount] = useState({
    higherPeriodSalesCount: 0,
    salesCount: 0,
  });
  const [stockCount, setStockCount] = useState(0);
  const [graphRevenue, setGraphRevenue] = useState<GraphData[]>([]);
  const [productSales, setProductSales] = useState<
    { id: string; name: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const paginate = (
    data: ProductColumn[],
    page: number,
    pageSize: number
  ): ProductColumn[] => {
    if (data.length === 0) return [];
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  useEffect(() => {
    paginate(productSales, page, pageSize);
    const element = document.getElementById("sales");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [productSales, page, pageSize]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const { data } = await axios.get(`/api/${param.storeId}/actions/`, {
        params: { period },
      });
      setTotalRevenue(data.totalRevenue);
      setSalesCount(data.salesCount);
      setStockCount(data.stockCount);
      setGraphRevenue(data.graphRevenue);
      setProductSales(data.productSales);
      setLoading(false);
    };
    fetchData();
  }, [param.storeId, period]);

  const onChangePeriod = (value: statPeriodsType) => {
    setPeriod(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Завантаження...
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Статистика"
            description="Переглянь стан свого магазину"
          />
          <Select onValueChange={onChangePeriod} defaultValue={period}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Виберіть період" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Звітній період</SelectLabel>
                {statPeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Separator />
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Загальна сума продажів
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                +{formatter.format(totalRevenue.totalRevenue)}/
                {formatter.format(totalRevenue.higherPeriodTotalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Кількість замовлень
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{salesCount.salesCount}/{salesCount.higherPeriodSalesCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Продуктів на складі
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockCount}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Статистика продажів</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphRevenue} />
          </CardContent>
        </Card>
        <Separator />
        <Heading title="Продажі" description="Топ продажів" />
        <a hidden id="sales" />
        <DataTable
          searchKey="name"
          columns={columns}
          data={productSales}
          page={page}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};
