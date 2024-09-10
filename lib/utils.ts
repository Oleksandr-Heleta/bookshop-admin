import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat('uk-UA', {
  currency: 'UAH',
  style: 'currency',
});

export const statuses = [
  { name: 'Не оброблено', value: 'new' },
  { name: 'Оплачено', value: 'paid' },
  { name: 'Відхилено', value: 'failed' },
  { name: 'Зпаковано', value: 'ready' },
  { name: 'Відправлено', value: 'sended' },
];

export const states = [
  { name: 'Накладений платіж', value: 'afterrecive' },
  { name: 'За реквізитами', value: 'byIBAN' },
  { name: 'Онлайн', value: 'online' },
];

export const posts = [
  { name: 'Укр пошта', value: 'ukr-post' },
  { name: 'Нова пошта', value: 'new-post' },
];

export const deliveries = [
  { name: 'До відділення', value: 'post' },
  { name: 'За адресою', value: 'courier' },
];
