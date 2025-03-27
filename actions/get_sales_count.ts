import prismadb from "@/lib/prismadb";
import { getStartDates, statPeriodsType } from "@/lib/utils";

export const getSalesCount = async (
  storeId: string,
  period: statPeriodsType = "all"
) => {
  const { startDate, higherPeriodStartDate } = getStartDates(period);
  const salesCount = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: startDate,
      },
    },
  });

  const higherPeriodSalesCount = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: higherPeriodStartDate,
      },
    },
  });

  return {
    salesCount,
    higherPeriodSalesCount,
  };
};
