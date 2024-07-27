import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

const bearer_Uuid = "8f0ceccf-1680-36c6-b077-f083711da047";

const corsHeaders = {
  "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const getPostOffices = async (cityId: string, postindex: string) => {
  const response = await fetch(
    `https://www.ukrposhta.ua/address-classifier-ws/get_postoffices_by_city_id?city_id=${cityId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearer_Uuid}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.Entries.Entry;
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("city_id") || undefined;
    const postindex = searchParams.get("postindex") || undefined;
    const postOfficesInCity = await getPostOffices(
      cityId as string,
      postindex as string
    );
    console.log(postOfficesInCity);
    const postOffices = postOfficesInCity
      .filter((postOffice: any) => {
        return (postOffice.POSTINDEX.includes(postindex) && ( postOffice.TYPE_SHORT == 'Пересувне відділення' || postOffice.TYPE_SHORT == 'Міське відділення')) ;
      })
      .map((postOffice: any) => {
        return {
          id: postOffice.ID,
          name: `${postOffice.POSTINDEX} (${(postOffice.TYPE_SHORT == 'Пересувне відділення')? postOffice.PO_SHORT : postOffice.ADDRESS})`,
        };
      });
    
    return NextResponse.json({ data: postOffices }, { headers: corsHeaders });
  } catch (error) {
    console.log("[POSTOFICE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
