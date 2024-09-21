import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { format } from 'date-fns';

const googleShoppingNamespace = 'http://base.google.com/ns/1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': `*`,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  if (!params.storeId) {
    return new NextResponse('Store ID is required', { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isArchived: false,
      quantity: { gt: 0 },
    },
    include: {
      categories: true,
      ageGroups: true,
      publishing: true,
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  const ageGroups = await prismadb.ageGroup.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="${googleShoppingNamespace}" version="2.0">
  <channel>
    <title>Магазин дитячих книг МИШКА</title>
    <link>${process.env.FRONTEND_STORE_URL}</link>
    <description>Купуйте книги для дітей онлайн</description>
    ${products
      .map(
        (product) => `
      <item>
        <g:id>${product.id}</g:id>
        <g:title><![CDATA[${product.name}. Дитяча книга]]></g:title>
        <g:description><![CDATA[${product.description}]]></g:description>
        <g:link>${process.env.FRONTEND_STORE_URL}/product/${product.id}</g:link>
        <g:image_link>${product.images[0]?.url ?? ''}</g:image_link>
        <g:price>${product.price} UAH</g:price>
        <g:availability>${
          product.quantity > 0 ? 'in stock' : 'out of stock'
        }</g:availability>
        <g:brand><![CDATA[${product.publishing.name}]]></g:brand>
        <g:google_product_category>![CDATA[Media > Books > Children's Books]]</g:google_product_category>
        <g:product_type><![CDATA[Books & Magazines > Books > Children's Books]]></g:product_type>
        <g:condition>new</g:condition>
        <g:sale_price>${
          product.isSale
            ? product.price.toNumber() -
              (product.price.toNumber() * product.sale) / 100
            : product.price
        } UAH</g:sale_price>
        <g:item_group_id>${product.id}</g:item_group_id>
        <g:age_group>kids</g:age_group>
        <g:custom_label_0>![CDATA[Вік: ${product.ageGroups
          .map(
            (age) =>
              ageGroups.find((ageGroup) => ageGroup.id === age.ageGroupId)?.name
          )
          .join(', ')} роки]]</g:custom_label_0>
        <g:custom_label_1>![CDATA[Категорія: ${product.categories
          .map(
            (category) =>
              categories.find((cat) => cat.id === category.categoryId)?.name
          )
          .join(', ')}]]</g:custom_label_1>
      </item>
    `
      )
      .join('')}
  </channel>
</rss>
  `;

  const response = new NextResponse(xml.trim(), {
    status: 200,
    headers: corsHeaders,
  });
  response.headers.set('Content-Type', 'application/xml');
  return response;
}
