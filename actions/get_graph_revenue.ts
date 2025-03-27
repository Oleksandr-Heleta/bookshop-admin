import prismadb from "@/lib/prismadb";
import { statPeriodsType, getStartDates } from "@/lib/utils";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
} from "date-fns";
import { uk } from "date-fns/locale";

export interface GraphData {
  name: string;
  current: number;
  prev: number;
}

const monthMap: { [key: string]: string } = {
  січня: "Січень",
  лютого: "Лютий",
  березня: "Березень",
  квітня: "Квітень",
  травня: "Травень",
  червня: "Червень",
  липня: "Липень",
  серпня: "Серпень",
  вересня: "Вересень",
  жовтня: "Жовтень",
  листопада: "Листопад",
  грудня: "Грудень",
};

export const getGraphRevenue = async (
  storeId: string,
  period: statPeriodsType = "all"
): Promise<GraphData[]> => {
  // console.log("peroid", period);

  const getOrders = async (
    storeId: string,
    startDate: Date,
    higherPeriodStartDate: Date
  ) => {
    const paidOrders = await prismadb.order.findMany({
      where: {
        storeId,
        isPaid: true,
        createdAt: {
          gte: startDate,
        },
      },
    });

    const previousPaidOrders = await prismadb.order.findMany({
      where: {
        storeId,
        isPaid: true,
        createdAt: {
          gte: higherPeriodStartDate,
          lt: startDate,
        },
      },
    });

    return { paidOrders, previousPaidOrders };
  };

  const formatDate = (date: Date, type: statPeriodsType) => {
    switch (type) {
      case "day":
      case "week":
        return format(date, "EEEE", { locale: uk }); // Назви днів тижня
      case "month":
        return `Тиждень ${Math.ceil(date.getDate() / 7)}`; // Тижні місяця
      case "year":
      case "all":
        return format(date, "MMMM", { locale: uk }); // Назви місяців
      default:
        return "";
    }
  };

  const graphData: GraphData[] = [];

  if (period === "year" || period === "all") {
    const startDate = startOfYear(new Date()); // Початок поточного року
    const higherPeriodStartDate = startOfYear(subYears(new Date(), 1)); // Початок попереднього року

    const { paidOrders, previousPaidOrders } = await getOrders(
      storeId,
      startDate,
      higherPeriodStartDate
    );

    const yearGraphData: GraphData[] = [
      { name: "Січень", current: 0, prev: 0 },
      { name: "Лютий", current: 0, prev: 0 },
      { name: "Березень", current: 0, prev: 0 },
      { name: "Квітень", current: 0, prev: 0 },
      { name: "Травень", current: 0, prev: 0 },
      { name: "Червень", current: 0, prev: 0 },
      { name: "Липень", current: 0, prev: 0 },
      { name: "Серпень", current: 0, prev: 0 },
      { name: "Вересень", current: 0, prev: 0 },
      { name: "Жовтень", current: 0, prev: 0 },
      { name: "Листопад", current: 0, prev: 0 },
      { name: "Грудень", current: 0, prev: 0 },
    ];

    for (const order of paidOrders) {
      const monthInGenitive = format(order.createdAt, "MMMM", { locale: uk }); // Назва місяця в родовому відмінку
      const month = monthMap[monthInGenitive]; // Перетворення в називний відмінок
      const index = yearGraphData.findIndex((data) => data.name === month);
      if (index !== -1) {
        yearGraphData[index].current += order.totalPrice.toNumber();
      }
    }

    for (const order of previousPaidOrders) {
      const monthInGenitive = format(order.createdAt, "MMMM", { locale: uk }); // Назва місяця в родовому відмінку
      const month = monthMap[monthInGenitive]; // Перетворення в називний відмінок
      const index = yearGraphData.findIndex((data) => data.name === month);
      if (index !== -1) {
        yearGraphData[index].prev += order.totalPrice.toNumber();
      }
    }

    return yearGraphData;
  }

  if (period === "month") {
    const startDate = startOfMonth(new Date()); // 1 число нинішнього місяця
    const higherPeriodStartDate = startOfMonth(subMonths(new Date(), 1)); // 1 число попереднього місяця

    const { paidOrders, previousPaidOrders } = await getOrders(
      storeId,
      startDate,
      higherPeriodStartDate
    );

    // Визначаємо кількість днів у поточному місяці
    const daysInMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ).getDate();

    // Ініціалізуємо дані для графіка
    const monthGraphData: GraphData[] = Array.from(
      { length: daysInMonth },
      (_, i) => ({
        name: `${i + 1}`,
        current: 0,
        prev: 0,
      })
    );

    // Обробка замовлень поточного місяця
    for (const order of paidOrders) {
      const day = order.createdAt.getDate(); // Отримуємо день місяця
      const index = monthGraphData.findIndex((data) => data.name === `${day}`);
      if (index !== -1) {
        monthGraphData[index].current += order.totalPrice.toNumber();
      }
    }

    // Обробка замовлень попереднього місяця
    for (const order of previousPaidOrders) {
      const day = order.createdAt.getDate(); // Отримуємо день місяця
      const index = monthGraphData.findIndex((data) => data.name === `${day}`);
      if (index !== -1) {
        monthGraphData[index].prev += order.totalPrice.toNumber();
      }
    }

    return monthGraphData;
  }

  if (period === "week" || period === "day") {
    const startDate = startOfWeek(new Date(), { locale: uk, weekStartsOn: 1 });
    const higherPeriodStartDate = startOfWeek(subWeeks(new Date(), 1), {
      locale: uk,
      weekStartsOn: 1,
    }); // Попередній тиждень
    console.log("startDate", startDate);
    console.log("higherPeriodStartDate", higherPeriodStartDate);
    const { paidOrders, previousPaidOrders } = await getOrders(
      storeId,
      startDate,
      higherPeriodStartDate
    );

    const weekGraphData: GraphData[] = [
      { name: "Понеділок", current: 0, prev: 0 },
      { name: "Вівторок", current: 0, prev: 0 },
      { name: "Середа", current: 0, prev: 0 },
      { name: "Четвер", current: 0, prev: 0 },
      { name: "П'ятниця", current: 0, prev: 0 },
      { name: "Субота", current: 0, prev: 0 },
      { name: "Неділя", current: 0, prev: 0 },
    ];

    const capitalizeFirstLetter = (text: string) =>
      text.charAt(0).toUpperCase() + text.slice(1);
    // console.log("previousPaidOrders", previousPaidOrders);

    for (const order of paidOrders) {
      const day = capitalizeFirstLetter(
        format(order.createdAt, "EEEE", { locale: uk })
      );
      console.log(day);
      const index = weekGraphData.findIndex((data) => data.name == day);
      if (index !== -1) {
        weekGraphData[index].current += order.totalPrice.toNumber();
      }
    }

    for (const order of previousPaidOrders) {
      const day = capitalizeFirstLetter(
        format(order.createdAt, "EEEE", { locale: uk })
      );
      const index = weekGraphData.findIndex((data) => data.name == day);
      if (index !== -1) {
        weekGraphData[index].prev += order.totalPrice.toNumber();
      }
    }
    // console.log(weekGraphData);
    return weekGraphData;
  }

  return graphData;
};
