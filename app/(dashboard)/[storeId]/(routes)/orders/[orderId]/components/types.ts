import { Order, Product } from "@prisma/client";


export type OrderItem = {
  productId: string | null;
  quantity: number;
};

export type ProductWithNumberPrice = Omit<Product, 'price'> & { price: number };

export interface OrderFormProps {
  initialData:
    | (Order & {
        orderItems: OrderItem[];
      })
    | null;

  products: ProductWithNumberPrice[];
}