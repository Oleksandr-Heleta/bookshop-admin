import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat("uk-UA", {
  currency: "UAH",
  style: "currency",
});


export const statuses = [
  { name: "Не оброблено", value: "new" },
  { name: "Зпаковано", value: "ready" },
  { name: "Відправлено", value: "sended" },
];

export const states =  [
  { name: "Накладений платіж", value: "afterrecive" },
  { name: "Оплачено", value: "paided" },
  { name: "Не оплачено", value: "nonpaid" },
];