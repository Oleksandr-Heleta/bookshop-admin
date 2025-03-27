import axios from "axios";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { format, parseISO } from "date-fns";
import prismadb from "@/lib/prismadb";

const novaPoshtaApi = axios.create({
  baseURL: "https://api.novaposhta.ua/v2.0/json/",
});

const apiKeyNP = `0b9148efd708cee76617577c7575085c`;

const getCounterpartyContactPersons = async () => {
  const respons = await novaPoshtaApi.post(``, {
    apiKey: apiKeyNP,
    modelName: "CounterpartyGeneral",
    calledMethod: "getCounterpartyContactPersons",
    methodProperties: {
      Ref: "e3d254bf-0c64-11ef-bcd0-48df37b921da",
      Page: "1",
    },
  });

  if (respons.status !== 200) {
    throw new Error(`Failed to fetch data: ${respons.status}`);
  }

  return respons.data.data;
};

const saveContactPerson = async (data: any) => {
  const respons = await novaPoshtaApi.post(``, {
    apiKey: apiKeyNP,
    modelName: "ContactPersonGeneral",
    calledMethod: "save",
    methodProperties: {
      CounterpartyRef: "e3d254bf-0c64-11ef-bcd0-48df37b921da",
      FirstName: data.name,
      LastName: data.surname,
      Phone: data.phone,
    },
  });

  if (respons.status !== 200) {
    throw new Error(`Failed to fetch data: ${respons.status}`);
  }

  return respons.data.data[0]; //data[0];
};

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const reciveBody = await req.json();
    let {
      orderId,
      name,
      surname,
      phone,
      cityId,
      addressId,
      orderState,
      weight,
      width,
      height,
      length,
      payerType,
      cargoType,
      delivery,
      date,
      totalPrice,
    } = reciveBody;

    // console.log(reciveBody);

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const persons = await getCounterpartyContactPersons();

    phone = phone.replace(/\D/g, "");

    let person = persons.find(
      (person: any) =>
        person.Phones === `${phone}` &&
        person.FirstName === name &&
        person.LastName === surname
    );

    // console.log("before", person);
    if (!person) {
      person = await saveContactPerson({ name, surname, phone });
    }
    // console.log("after", person);

    let volume = "";
    if (cargoType !== "Documents") {
      volume = String(
        (Number(width) / 100) * (Number(height) / 100) * (Number(length) / 100)
      );
    }

    // console.log(totalPrice);
    const cost = String(totalPrice)
      .replace(/[^\d,]/g, "")
      .replace(",", ".");
    // console.log(cost);

    const requestBody: {
      apiKey: string;
      modelName: string;
      calledMethod: string;
      methodProperties: {
        PayerType: "Recipient" | "Sender";
        PaymentMethod: string;
        DateTime: string;
        CargoType: "Documents" | "Cargo" | "Pallet" | "Parcel";
        Weight: string;
        ServiceType:
          | "DoorsDoors"
          | "DoorsWarehouse"
          | "WarehouseWarehouse"
          | "WarehouseDoors";
        SeatsAmount: string;
        Description: string;
        Cost: string;
        CitySender: string;
        Sender: string;
        SenderAddress: string;
        ContactSender: string;
        SendersPhone: string;
        CityRecipient: string;
        Recipient: string;
        RecipientAddress: string;
        ContactRecipient: string;
        RecipientsPhone: string;
        OptionsSeat?: {
          volumetricVolume: string;
          volumetricWidth: string;
          volumetricLength: string;
          volumetricHeight: string;
          weight: string;
        }[];
        BackwardDeliveryData?: {
          PayerType: "Recipient" | "Sender";
          CargoType: "Money" | "Services";
          RedeliveryString: string;
        }[];
      };
    } = {
      apiKey: apiKeyNP,
      modelName: "InternetDocumentGeneral",
      calledMethod: "save",
      methodProperties: {
        PayerType: payerType,
        PaymentMethod: "Cash",
        DateTime: format(parseISO(date), "dd.MM.yyyy"),
        CargoType: cargoType,
        Weight: weight,
        ServiceType:
          delivery === "post" ? "WarehouseWarehouse" : "WarehouseDoors",
        SeatsAmount: "1",
        Description: "Книги",
        Cost: cost,
        CitySender: "f5554065-5712-11e1-a283-0026b97ed48a",
        Sender: "e3c034f0-0c64-11ef-bcd0-48df37b921da",
        SenderAddress: "144aa9f0-b1fc-11ed-9eb1-d4f5ef0df2b8",
        ContactSender: "bc87b0cb-0c78-11ef-bcd0-48df37b921da",
        SendersPhone: "380936482295",
        CityRecipient: cityId,
        Recipient: "e3d254bf-0c64-11ef-bcd0-48df37b921da",
        RecipientAddress: addressId,
        ContactRecipient: person.Ref,
        RecipientsPhone: phone,
        ...(cargoType !== "Documents"
          ? {
              OptionsSeat: [
                {
                  volumetricVolume: volume,
                  volumetricWidth: width,
                  volumetricLength: length,
                  volumetricHeight: height,
                  weight: weight,
                },
              ],
            }
          : {}),
        ...(orderState === "afterrecive"
          ? {
              BackwardDeliveryData: [
                {
                  PayerType: "Recipient",
                  CargoType: "Money",
                  RedeliveryString: cost,
                },
              ],
            }
          : {}),
      },
    };

    // console.log(requestBody);
    const response = await novaPoshtaApi.post(``, requestBody);
    if (!response.data.success) {
      throw new Error(response.data.errors[0]);
    }
    const { data } = response;
    // console.log(data);
    const intDocNumber = data.data[0].IntDocNumber;
    // console.log(intDocNumber);
    await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        ttnumber: intDocNumber,
      },
    });
    return NextResponse.json({ data: intDocNumber });
    // return  NextResponse.json({data: "ok"});
  } catch (error) {
    console.log("[DELIVERY_POST]", error);
    return new NextResponse(String(error), { status: 500 });
  }
}
