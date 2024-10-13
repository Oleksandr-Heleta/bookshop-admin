import axios from "axios";
import { NextResponse } from "next/server";

 const novaPoshtaApi = axios.create({
  baseURL: "https://api.novaposhta.ua/v2.0/json/",
});

const apiKeyNP = `0b9148efd708cee76617577c7575085c`;

const corsHeaders = {
  "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const cityNamePart = searchParams.get("cityNamePart") || undefined;

    const body: {
      apiKey: string;
      modelName: string;
      calledMethod: string;
      methodProperties: {
        CityName: string;
        Limit: string;
        Page: string;
      };
    } = {
      apiKey: apiKeyNP,
      modelName: "AddressGeneral",
      calledMethod: "searchSettlements",
      methodProperties: {
        CityName: cityNamePart || "а",
        Limit: "50",
        Page: "1",
      },
    };
    const { data, status } = await novaPoshtaApi.post(``, body);
    if (status !== 200) {
      throw new Error(`Failed to fetch data: ${status}`);
    }
    // console.log(data.data[0].Addresses);
    const cities = data.data[0].Addresses.map(
      (city: { DeliveryCity: string; Present: string }) => ({
        id: city.DeliveryCity,
        name: city.Present,
      })
    );
    // console.log(cities);
    return NextResponse.json({ data: cities }, { headers: corsHeaders });
  } catch (error) {
    console.log("[POSTCITIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
