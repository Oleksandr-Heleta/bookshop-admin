import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import {SettingsForm} from "./components/settings-form";

interface SettingsPageProps {
  params: {
    storeId: string;
  };
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  });

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const mainbillboards = await prismadb.mainBillboard.findMany({
    where: {
        storeId: params.storeId,
    }
});

  

  if(!store){
    redirect('/');
  }

  return(<div className="flex-col">
    <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} billboards={billboards} mainbillboards={mainbillboards} />
        </div>
    </div>);
};

export default SettingsPage;
