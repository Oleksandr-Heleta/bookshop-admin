import prismadb from "@/lib/prismadb";
import { OrderForm } from "./components/order-form";
import { Product } from "@prisma/client";

const OrderPage = async ({
  params,
}: {
  params: {
    orderId: string;
    storeId: string;
  };
}) => {
  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
    },
    include: {
        orderItems: true,
    },
  });

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
        images: true,
    }
  });

 const formattedProducts = (products: Product[]) => {
  return products.map(product => {return {
    id: product.id,
    name : product.name,
    quantity: product.quantity,
    price: parseFloat(String(product?.price)),
       };})
 }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderForm
          products={products}
          initialData={order}
        />
      </div>
    </div>
  );
};

export default OrderPage;