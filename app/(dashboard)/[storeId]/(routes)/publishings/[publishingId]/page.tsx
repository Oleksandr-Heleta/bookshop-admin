import prismadb from "@/lib/prismadb";
import { PublishingForm } from "./components/publishing-form";


const PublishingPage = async ({
  params,
}: {
  params: {
    publishingId: string;
  };
}) => {
const publishing = await prismadb.publishing.findUnique({
    where: {
        id: params.publishingId
    }
});

  return (
  <div className="flex-col">
    <div className="flex-1 space-y-4 p-8 pt-6">
<PublishingForm initialData={publishing}/>
    </div>
  </div>);
};

export default PublishingPage;
