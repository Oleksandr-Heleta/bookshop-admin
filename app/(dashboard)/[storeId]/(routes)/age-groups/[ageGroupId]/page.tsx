import prismadb from "@/lib/prismadb";
import { AgeGroupForm } from "./components/age-group-form";


const AgeGroupPage = async ({
  params,
}: {
  params: {
    ageGroupId: string;
  };
}) => {
const ageGroup = await prismadb.ageGroup.findUnique({
    where: {
        id: params.ageGroupId
    }
});

  return (
  <div className="flex-col">
    <div className="flex-1 space-y-4 p-8 pt-6">
<AgeGroupForm initialData={ageGroup}/>
    </div>
  </div>);
};

export default AgeGroupPage;
