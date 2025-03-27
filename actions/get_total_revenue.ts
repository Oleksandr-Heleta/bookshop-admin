import prismadb from "@/lib/prismadb";
import { getStartDates, statPeriodsType } from "@/lib/utils";

export const getTotalRevenue = async (
  storeId: string,
  period: statPeriodsType = "all"
) => {
  const { startDate, higherPeriodStartDate } = getStartDates(period);

  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const higherPeriodPaidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: higherPeriodStartDate,
      },
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    return total + order.totalPrice.toNumber();
  }, 0);

  const higherPeriodTotalRevenue = higherPeriodPaidOrders.reduce(
    (total, order) => {
      return total + order.totalPrice.toNumber();
    },
    0
  );

  return {
    totalRevenue,
    higherPeriodTotalRevenue,
  };
};
