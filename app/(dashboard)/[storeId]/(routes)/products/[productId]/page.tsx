import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params,
}: {
  params: {
    productId: string;
    storeId: string;
  };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      collections: true,
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const collections = await prismadb.collection.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const publishings = await prismadb.publishing.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          collections={collections}
          publishings={publishings}
          initialData={product ? {...product, price: parseFloat(String(product?.price)),} : null}
        />
      </div>
    </div>
  );
};

export default ProductPage;
