import prismadb from "@/lib/prismadb";
import { CollorForm } from "./components/collor-form";


const CollorPage = async ({
  params,
}: {
  params: {
    collorId: string;
  };
}) => {
const collor = await prismadb.collor.findUnique({
    where: {
        id: params.collorId
    }
});

  return (
  <div className="flex-col">
    <div className="flex-1 space-y-4 p-8 pt-6">
<CollorForm initialData={collor}/>
    </div>
  </div>);
};

export default CollorPage;
