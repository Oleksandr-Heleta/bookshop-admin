import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import prismadb from "./prismadb";
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
  { name: "Зпаковано", value: "ready", color: "red-500" },
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
