import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from "next/server";

const bearer_Uuid = '8f0ceccf-1680-36c6-b077-f083711da047'

const corsHeaders = {
    "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  
  export async function OPTIONS () {
    return NextResponse.json({}, { headers: corsHeaders });
  };
  

const getCitiesByName = async (cityNamePart: string) => {
    const response = await fetch(`https://www.ukrposhta.ua/address-classifier-ws/get_city_by_region_id_and_district_id_and_city_ua?city_ua=${cityNamePart}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearer_Uuid}`,
        'Accept': 'application/json'
      }
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  
   

  const data = await response.json();
  return data.Entries.Entry;
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
  )   {
    // const body = await req.json();
    // let {
    //     cityNamePart,
    // } = body;

  try {
    const { searchParams } = new URL(req.url);
    const cityNamePart = searchParams.get("cityNamePart") || undefined
    const data = await getCitiesByName(cityNamePart as string);
    const cities = data.slice(0, 100).map((city: any) => {
return {
        id: city.CITY_ID,
        name: `${city.SHORTCITYTYPE_UA} ${city.CITY_UA} (${city.DISTRICT_UA} р-н, ${city.REGION_UA} обл.)`
}
    })
    // console.log(cities);
    return NextResponse.json({data:cities}, { headers: corsHeaders }); 
} catch (error) {
  console.log("[POSTCITIES_GET]", error);
  return new NextResponse("Internal error", { status: 500 });
}
}