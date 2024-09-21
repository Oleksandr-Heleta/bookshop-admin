import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { format } from 'date-fns';

const rozetkaNamespace = 'http://rozetka.com.ua/ns/1.0';

const ages = [
  {
    id: '96626225-5f37-4e39-8809-019b498196a7',
    name: '0 місяців, 1 місяць, 2 місяці, 3 місяці, 4 місяці, 5 місяців, 6 місяців, 7 місяців, 8 місяців, 9 місяців, 10 місяців, 11 місяців, 1 рік, 14 місяців, 15 місяців, 16 місяців, 1.5 року, 2 роки',
    value:
      '1416448, 1416456, 1416464, 1416472, 1416480, 1416488, 1416496, 1416504, 1416512, 1416520, 1416528, 1416536, 1416544, 1416552, 1416560, 4284847, 3331309, 4284850',
  },
  {
    id: '73fedaf5-61c2-446c-ab4d-05267e6e04b7',
    name: '2 роки, 2.5 роки, 3 роки, 3.5 роки, 4 роки',
    value: '1416560, 1475096, 1416568, 1475120, 1416576',
  },

  {
    id: '468ea9fb-cdbc-4c50-9913-d8171ad3ff21',
    name: '4 роки, 5 років, 6 років',
    value: '1416576, 1416584, 1416592',
  },
  {
    id: '3f34327c-df5b-462f-865e-8effc4e60328',
    name: '6 років, 7 років, 8 років, 9 років',
    value: '1416592, 1416600, 1416608, 1416616',
  },
  {
    id: '4ffa0424-c715-443f-9a9f-ca27c7e96097',
    name: '9 років, 10 років, 11 років, 12 років',
    value: '1416616, 1416624, 1416632, 1416640',
  },
];

const categoriesRz = [
  {
    id: '81a246e3-d733-4f43-ae4a-3a4f1bebfcc6',
    name: 'Вімельбухи',
    value: '1183175',
  },
  {
    id: '74eb3af2-17b5-47b7-b945-76a3da86d3de',
    name: 'Енциклопедії, Пізнавальні та розвивальні книги',
    value: '2226814, 360309',
  },
  {
    id: 'a555dbc2-ca23-4b21-ac39-56397711b251',
    name: 'Поезія',
    value: '512894',
  },
  {
    id: '4465928e-f9d2-49f8-ac8e-4c9cb3d1e12f',
    name: 'Інтерактивні книжки та ручки',
    value: '783330',
  },
  {
    id: '862d7e4e-d0e4-49e2-9bf6-3e49c637d747',
    name: 'Пізнавальні та розвивальні книги',
    value: '360309',
  },
  {
    id: '321a26c8-f575-43c1-a3d7-8f5a121a5245',
    name: 'Пізнавальні та розвивальні книги',
    value: '360309',
  },
];

interface Item {
  id: string;
  name?: string;
  value?: string;
  [key: string]: any; // Додаткові поля
}

function combineValuesByKey(
  array1: Item[],
  array2: Item[],
  key: string,
  returnType: 'value' | 'name'
): (string | undefined)[] {
  // Створюємо об'єкт для швидкого доступу до об'єктів другого масиву за їх ключем
  const array2Map = array2.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, Item>);

  // Використовуємо reduce для проходження по першому масиву і додавання value або name з другого масиву
  const result = array1.reduce((acc, item) => {
    if (array2Map[item[key]] !== undefined) {
      acc.push(array2Map[item[key]][returnType]);
    }
    return acc;
  }, [] as (string | undefined)[]);

  return result;
}

function removeDuplicateWords(inputString: string): string {
  // Розбиваємо строку на масив слів
  const words = inputString.split(', ');

  // Використовуємо множину для відстеження унікальних слів
  const seenWords = new Set<string>();
  const filteredWords = [];

  for (const word of words) {
    if (!seenWords.has(word)) {
      seenWords.add(word);
      filteredWords.push(word);
    }
  }

  // Об'єднуємо відфільтровані слова назад у строку
  return filteredWords.join(', ');
}

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
    },
    include: {
      categories: true,
      publishing: true,
      ageGroups: {
        orderBy: {
          ageGroupName: 'asc',
        },
      },
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
    orderBy: {
      value: 'asc',
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${format(new Date(), 'yyyy-MM-dd HH:mm')}">
<shop>
    <name>Магазин дитячих книг МИШКА</name>
  <url>${process.env.FRONTEND_STORE_URL}</url>
  <currencies>
<currency id="UAH" rate="1"/>
</currencies> 
    <categories>
<category id="1" rz_id="4005167">Дитячі книги</category>
<category id="2" rz_id="4626644">Книги для батьків</category>
</categories>
  <offers>
    ${products
      .filter(
        (product) =>
          !product.categories.find(
            (cat) => cat.categoryId == '7175b649-5b31-4e97-8ca3-92766d2550bd'
          )
      )
      .map(
        (product) => `
      <offer id="${product.id}" available="${product.isArchived}">
        
        <categoryId>1</categoryId>
        
        <vendor><![CDATA[${product.publishing.name}]]></vendor>
        <name><![CDATA[${product.name}]]></name>
        <name_ua><![CDATA[${product.name}]]></name_ua>
        <description><![CDATA[${product.description}]]></description>
        <description_ua><![CDATA[${product.description}]]></description_ua>
        <stock_quantity>${product.quantity}</stock_quantity>
        <url>${process.env.FRONTEND_STORE_URL}/product/${product.id}</url>
        <state>new</state>
        <price>${product.price}</price>
        <currencyId>UAH</currencyId>
        ${product.images
          .map((image) => `<picture>${image.url}</picture>`)
          .join('')}
        <param id="151000" name="Вік"  value="${removeDuplicateWords(
          combineValuesByKey(
            product.ageGroups,
            ages,
            'ageGroupId',
            'value'
          ).join(', ')
        )}">${removeDuplicateWords(
          combineValuesByKey(
            product.ageGroups,
            ages,
            'ageGroupId',
            'name'
          ).join(', ')
        )}</param>
         
        <param id="77775" name="Розділ" value="360285, 360303, ${removeDuplicateWords(
          combineValuesByKey(
            product.categories,
            categoriesRz,
            'categoryId',
            'value'
          ).join(', ')
        )}">Дитячі розваги та дозвілля, Книги для дошкільнят, ${removeDuplicateWords(
          combineValuesByKey(
            product.categories,
            categoriesRz,
            'categoryId',
            'name'
          ).join(', ')
        )}</param>
           <param id="98900" name="Країна-виробник товару"  value="544338">Україна</param>
           <param id="68569" name="Мова"  value="253362">Українська</param>
         
           ${
             product.titleSheet == 'Solid'
               ? '<param id="77355" name="Палітурка" value="356403">Тверда</param>'
               : '<param id="77355" name="Палітурка" value="356397">М&apos;яка</param>'
           }
        
        <param name="Кількість сторінок">${product.sheets}</param>
        <param name="Розмір">${product.size}</param>
      </offer>
    `
      )
      .join('')}

       ${products
         .filter(
           (product) =>
             !!product.categories.find(
               (cat) => cat.categoryId == '7175b649-5b31-4e97-8ca3-92766d2550bd'
             )
         )
         .map(
           (product) => `
      <offer id="${product.id}" available="${product.isArchived}">
        <categoryId>2</categoryId>
        <vendor><![CDATA[${product.publishing.name}]]></vendor>
        <name><![CDATA[${product.name}]]></name>
        <name_ua><![CDATA[${product.name}]]></name_ua>
        <description><![CDATA[${product.description}]]></description>
        <description_ua><![CDATA[${product.description}]]></description_ua>
        <stock_quantity>${product.quantity}</stock_quantity>
        <url>${process.env.FRONTEND_STORE_URL}/product/${product.id}</url>
        <state>new</state>
        <price>${product.price}</price>
        <currencyId>UAH</currencyId>
        ${product.images
          .map((image) => `<picture>${image.url}</picture>`)
          .join('')}
           <param id="98900" name="Країна-виробник товару"  value="544338">Україна</param>
           <param id="86479" name="Мова"  value="420844">Український</param>
            <param id="70378" name="Мова"  value="275240">Українська</param>
           <param id="86464" name="Розділ" value="420824">Виховання і Дитяча психологія</param>
           ${
             product.titleSheet == 'Solid'
               ? '<param id="86514" name="Палітурка" value="420804">Тверда</param>'
               : '<param id="86514" name="Палітурка" value="420809">М&apos;яка</param>'
           }
        <param name="Кількість сторінок">${product.sheets}</param>
        <param name="Розмір">${product.size}</param>
      </offer>
    `
         )
         .join('')}
      
  </offers>
</shop>
</yml_catalog>
  `;

  const response = new NextResponse(xml.trim(), {
    status: 200,
    headers: corsHeaders,
  });
  response.headers.set('Content-Type', 'application/xml');
  return response;
}
