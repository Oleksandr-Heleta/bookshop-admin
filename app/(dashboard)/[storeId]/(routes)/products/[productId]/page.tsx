import prismadb from '@/lib/prismadb';
import { ProductForm } from './components/product-form';

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
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      ageGroups: true,
      categories: true,
      seria: true,
      suggestionProducts: true,
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const ageGroups = await prismadb.ageGroup.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const publishings = await prismadb.publishing.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const serias = await prismadb.seria.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          ageGroups={ageGroups}
          publishings={publishings}
          serias={serias}
          products={products}
          initialData={
            product
              ? {
                  ...product,
                  price: parseFloat(String(product?.price)),
                  seriaId: product.seriaId ?? '',
                  suggestionProducts: product.suggestionProducts ?? [],
                  titleSeo: product.titleSeo ?? '',
                  descriptionSeo: product.descriptionSeo ?? '',
                }
              : null
          }
        />
      </div>
    </div>
  );
};

export default ProductPage;
