import axios from 'axios';
import { NextResponse } from 'next/server';
 const novaPoshtaApi = axios.create({
  baseURL: 'https://api.novaposhta.ua/v2.0/json/',
});

const apiKeyNP = `0b9148efd708cee76617577c7575085c`;


const corsHeaders = {
  'Access-Control-Allow-Origin': `${process.env.FRONTEND_STORE_URL}`,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export  async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('city_id') || undefined;
    const postindex = searchParams.get('postindex') || undefined;
    
      const body: {
        apiKey: string;
        modelName: string;
        calledMethod: string;
        methodProperties: {
          CityRef: string;
  
          Limit: string;
          Language: string;
          FindByString: string;
        };
      } = {
        apiKey: apiKeyNP,
        modelName: 'AddressGeneral',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityId || 'Київ',
          Limit: '50',
          Language: 'UA',
          FindByString: postindex || '',
        },
      };
      // console.log(body);
      const { data, status } = await novaPoshtaApi.post(``, body);
      if (status !== 200) {
        throw new Error(`Failed to fetch data: ${status}`);
      }
      // console.log(postindex, data.data);
      const postOffices = data.data.map((post: { Ref: string; Description: string }) => ({
        id: post.Ref,
        name: post.Description,
      }));
      // console.log(postOffices);
      return NextResponse.json({ data: postOffices }, { headers: corsHeaders });
    } catch (error) {
      console.log('[POSTOFICE_GET]', error);
      return new NextResponse('Internal error', { status: 500 });
    }
  }
  
  // 'e3d254bf-0c64-11ef-bcd0-48df37b921da'

  // "e3c034f0-0c64-11ef-bcd0-48df37b921da"
