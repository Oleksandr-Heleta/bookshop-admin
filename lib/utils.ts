import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import prismadb from "./prismadb";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subYears,
} from "date-fns";
import { uk } from "date-fns/locale";
import { PrismaClient } from "@prisma/client";
import { ca } from "date-fns/locale";
import { columns } from "@/app/(dashboard)/[storeId]/(routes)/age-groups/components/columns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("uk-UA", {
  currency: "UAH",
  style: "currency",
});

export async function generateUniqueId(query: "product" | "order") {
  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
    let existingRecord;
    if (query === "product") {
      uniqueId = `P${uniqueId}`;
      existingRecord = await prismadb.product.findFirst({
        where: { id: uniqueId },
      });
    } else {
      uniqueId = `M${uniqueId}`;
      existingRecord = await prismadb.order.findFirst({
        where: { id: uniqueId },
      });
    }
    if (!existingRecord) {
      isUnique = true;
    }
  }

  return uniqueId;
}

export async function ChangeId(
  oldId: string,
  newId: string,
  table: "category" | "ageGroup" | "publishing" | "series"
) {
  console.log(oldId, newId, table);
  try {
    switch (table) {
      case "category":
        await prismadb.category.update({
          where: {
            id: oldId,
          },
          data: {
            id: newId,
          },
        });
      case "ageGroup":
        await prismadb.ageGroup.update({
          where: {
            id: oldId,
          },
          data: {
            id: newId,
          },
        });
      case "publishing":
        await prismadb.publishing.update({
          where: {
            id: oldId,
          },
          data: {
            id: newId,
          },
        });
      case "series":
        await prismadb.seria.update({
          where: {
            id: oldId,
          },
          data: {
            id: newId,
          },
        });
    }
  } catch (error) {
    console.log("error", error);
  }

  return newId;
}

export const statuses = [
  { name: "Не оброблено", value: "new", color: "red-500" },
  { name: "Запаковано", value: "ready", color: "green-500" },
  { name: "Відправлено", value: "sended", color: "black" },
  { name: "Повернуто", value: "returned", color: "black" },
  { name: "Завершено", value: "completed", color: "black" },
];

export const states = [
  { name: "Накладений платіж", value: "afterrecive" },
  { name: "За реквізитами", value: "byIBAN" },
  { name: "Онлайн", value: "online" },
  { name: "Відхилено", value: "failed" },
];

export const posts = [
  { name: "Укр пошта", value: "ukr-post" },
  { name: "Нова пошта", value: "new-post" },
];

export const deliveries = [
  { name: "До відділення", value: "post" },
  { name: "За адресою", value: "courier" },
];

export type statPeriodsType = "day" | "week" | "month" | "year" | "all";

export const statPeriods = [
  { name: "За день", value: "day" },
  { name: "За тиждень", value: "week" },
  { name: "За місяць", value: "month" },
  { name: "За рік", value: "year" },
  { name: "За весь час", value: "all" },
];

export const getStartDates = (
  period: statPeriodsType
): { startDate: Date; higherPeriodStartDate: Date } => {
  const now = new Date();
  let startDate: Date;
  let higherPeriodStartDate: Date;

  switch (period) {
    case "day":
      startDate = startOfDay(now);
      higherPeriodStartDate = startOfWeek(now, { locale: uk, weekStartsOn: 1 }); // Тиждень починається з понеділка
      break;
    case "week":
      startDate = startOfWeek(now, { locale: uk, weekStartsOn: 1 }); // Тиждень починається з понеділка
      higherPeriodStartDate = startOfMonth(now);
      break;
    case "month":
      startDate = startOfMonth(now);
      higherPeriodStartDate = startOfYear(now);
      break;
    case "year":
      startDate = startOfYear(now);
      higherPeriodStartDate = subYears(startDate, 1);
      break;
    default:
      startDate = new Date(0); // За весь час
      higherPeriodStartDate = new Date(0); // За весь час
      break;
  }

  return { startDate, higherPeriodStartDate };
};
