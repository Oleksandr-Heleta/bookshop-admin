import prismadb from "@/lib/prismadb";
import { OrderForm } from "./components/order-form";

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