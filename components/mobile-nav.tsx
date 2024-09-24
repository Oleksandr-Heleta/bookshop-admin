'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

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
    <>
      <Button onClick={toggleMenu} className="m-2 lg:hidden">
        <Menu size={20} />
      </Button>

      <div
        className={`fixed z-10 inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        // onClick={toggleMenu}
      >
        <div
          className={`fixed z-10 top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center justify-center bg-primary text-white">
            Меню
          </div>
          <Button
            onClick={toggleMenu}
            className="absolute top-2 right-2 text-white"
          >
            <X size={20} />
          </Button>
          <nav className="p-4 mt-2 flex flex-col divide-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={toggleMenu}
                className={cn(
                  'text-lg font-medium transition-colors p-2 hover:text-primary',
                  route.active
                    ? 'text-black dark:text-white'
                    : 'text-muted-foreground'
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
