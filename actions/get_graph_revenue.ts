import prismadb from "@/lib/prismadb";

interface GraphData {
  name: string;
  total: number;
}

export const getGraphRevenue = async (storeId: string): Promise<GraphData[]> => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const monthlyRevenue: { [key: number]: number } = {};

  // Grouping the orders by month and summing the revenue
  for (const order of paidOrders) {
    const month = order.createdAt.getMonth(); // 0 for Jan, 1 for Feb, ...
    let revenueForOrder = order.totalPrice.toNumber();


    // Adding the revenue for this order to the respective month
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }

  // Converting the grouped data into the format expected by the graph
  const graphData: GraphData[] = [
    { name: "Січень", total: 0 },
    { name: "Лютий", total: 0 },
    { name: "Березень", total: 0 },
    { name: "Квітень", total: 0 },
    { name: "Травень", total: 0 },
    { name: "Червень", total: 0 },
    { name: "Липень", total: 0 },
    { name: "Серпень", total: 0 },
    { name: "Вересень", total: 0 },
    { name: "Жовтень", total: 0 },
    { name: "Листопад", total: 0 },
    { name: "Грудень", total: 0 },
  ];

  // Filling in the revenue data
  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }

  return graphData;
};