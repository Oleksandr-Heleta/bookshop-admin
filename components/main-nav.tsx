'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.storeId}`,
      label: 'Статистика',
      active: pathname === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: 'Білборди',
      active: pathname === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/categories`,
      label: 'Категорії',
      active: pathname === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/age-groups`,
      label: 'Вік',
      active: pathname === `/${params.storeId}/age-groups`,
    },
    {
      href: `/${params.storeId}/publishings`,
      label: 'Видавництва',
      active: pathname === `/${params.storeId}/publishings`,
    },
    {
      href: `/${params.storeId}/serias`,
      label: 'Серії',
      active: pathname === `/${params.storeId}/serias`,
    },
    {
      href: `/${params.storeId}/products`,
      label: 'Товари',
      active: pathname === `/${params.storeId}/products`,
    },
    {
      href: `/${params.storeId}/orders`,
      label: 'Замовлення',
      active: pathname === `/${params.storeId}/orders`,
    },
    {
      href: `/${params.storeId}/settings`,
      label: 'Налаштування',
      active: pathname === `/${params.storeId}/settings`,
    },
  ];
  return (
    <nav className={cn(' items-center space-x-4 lg:space-x-6', className)}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active
              ? 'text-black dark:text-white'
              : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
