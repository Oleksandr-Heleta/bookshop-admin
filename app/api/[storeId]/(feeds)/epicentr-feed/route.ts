import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ages = [
  {id: 1, name: '15+', code: '38e17422adc97f3a64b1776ddd94ee83'},
  {id: 2, name: '17+', code: 'f3ef1c31f71827714b6c564236e3398e'},
  {id: 3, name: '8-10', code: '8cfec9e88534ff99385bfd59d1a87530'},
  {id: 4, name: '6+', code: 'a8e78d3733f5e2fbda6f69b98282b688'},
  {id: 5, name: '16+', code: 'a55831bc61be8f0b436151c257309389'},
  {id: 6, name: '0+', code: 'c51fd2d637b573a6ee6b04df96668321'},
  {id: 7, name: '4+', code: 'ec2116d6229a88f707a01f5c5ca53a75'},
  {id: 8, name: '5+', code: 'f611aad05eb2b77e6b833774f99cd198'},
  {id: 9, name: '1+', code: 'ff1080bd502a7d9d15d4c42278509a42'},
  {id: 10, name: '14+', code: 'e401342b3887151e1d6987013980bc1e'},
  {id: 11, name: '3+', code: '1c6631146ff9a74acc7b38503bdd0e4c'},
  {id: 12, name: '8+', code: '21cfcd75e37b4839a8adef081f50c14c'},
  {id: 13, name: '9+', code: '1f6f99a2ee1732f94612226813d8561e'},
  {id: 14, name: '10+', code: '505117fe3ec4b4b14abeeed823bea553'},
  {id: 15, name: '2+', code: '542fd2ff61446fca72f035d1418907eb',},
  {id: 16, name: '7+', code: '65028c929d4c6adf8f5286a3325e0176'},
  {id: 17, name: '11+', code: '5ab25f1ff66eb78d65f55d1a0fdad66b'},
  {id: 18, name: '18+', code: '5e3e4fb45d6ee2645401e772793e8972'},
  {id: 19, name: '12+', code: '5bf37a2ee5298aecc27dd5e3c00ce315'},
  {id: 20, name: '13+', code: 'cfa5174582434e7c0c1174553438b87d'},
  
]

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

  try {
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
date="${format(new Date(), 'yyyy-MM-dd HH:mm')}"
<offers>
 ${products .map(
        (product) => `
<offer id="${product.id}" available="${!product.isArchived}">
<price>${product.price}</price>
<price_old>199</price_old>
<category code="231" parentCode="230">Дитячі книги</category>
 ${product.images
          .map((image) => `<picture>${image.url}</picture>`)
          .join('')}
<name lang="ru"><![CDATA[[Книга ${
          product.author ? product.author : product.publishing?.name
        } «${product.name}» ${product.isbn ? '(' + product.isbn + ')' : ''}]]></name>
<name lang="ua"><![CDATA[Книга ${
          product.author ? product.author : product.publishing?.name
        } «${product.name}» ${product.isbn ? '(' + product.isbn + ')' : ''}]]></name>
<description lang="ru"><![CDATA[${product.description}]]></description>

<description lang="ua"><![CDATA[${product.description}]]></description>

<attribute_set code="231">Дитячі книги</attribute_set>
<param paramcode="country_of_origin" name="Країна-виробник" valuecode="ukr">Україна</param>
<param paramcode="2031" name="Мова" valuecode="3558e8c28b0ebb9794a1d7c3ec0cf397">українська</param>
<param paramcode="ratio" name="Мінімальна кратність товару"><![CDATA[1]]></param>

<param paramcode="13183" name="Розмір" valuecode="d7c3d344fd844ca187739e4f6a4d5baa">15x30</param>
<param paramcode="11887" name="Полотно" valuecode="c5380bbfa7fca64b5496a10bfde38b3a">поліестер</param>

<param paramcode="measure" name="Міра виміру" valuecode="measure_pcs">шт.</param>



<param paramcode="9875" name="Рівень складності" valuecode="b15bfd532157cfd62c9ba04987760e9c">середній</param>
<param paramcode="3176" name="Тематика" valuecode="bsz6btxa,wle9vq5zsirz1dni">тварини, коти</param>
<param lang="ru" paramcode="767" name="Комплектация"><![CDATA[Холст на подрамнике, краски, кисти.]]></param>
<param lang="ua" paramcode="767" name="Комплектація"><![CDATA[Полотно на підрамнику, пензлі, фарби.]]></param>
<param paramcode="country_of_origin" name="Країна-виробник" valuecode="chn" >Китай</param>
<param paramcode="brand" name="Бренд" valuecode="cz1445500250k5a9">Ідейка</param>
<param paramcode="width" name="Ширина"><![CDATA[10]]></param>
<param paramcode="height" name="Висота"><![CDATA[20]]></param>
<param paramcode="length" name="Глибина"><![CDATA[30]]></param>
<param paramcode="weight" name="Вага"><![CDATA[1000]]></param>
<param paramcode="barcodes" name="Штрих код"><![CDATA[4826664899]]></param>
</offer>`
      )
      .join('')}
</offers>
</yml_catalog>
  `;

    const response = new NextResponse(xml.trim(), {
      status: 200,
      headers: corsHeaders,
    });
    response.headers.set('Content-Type', 'application/xml');
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
