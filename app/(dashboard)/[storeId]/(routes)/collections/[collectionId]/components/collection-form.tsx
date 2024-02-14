"use client";

import { Collection } from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";

const formShema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

interface CollectionFormProps {
  initialData: Collection | null;
}

type CollectionFormValues = z.infer<typeof formShema>;

export const CollectionForm: React.FC<CollectionFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Редагування збірки" : "Створення збірки";
  const description = initialData ? "Редагуйте збірку" : "Додайте збірку";
  const toastMessage = initialData
    ? "Збірка оновлена."
    : "Збірка створена.";
  const action = initialData ? "Зберегти зміни" : "Створити";

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(formShema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });

  const onSubmit = async (data: CollectionFormValues) => {
    try {
      setLoading(true);
      if(initialData) {
      await axios.patch(`/api/${params.storeId}/collections/${params.collectionId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/collections`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/collections`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Щось пішло не так!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/collections/${params.collectionId}`);
      router.refresh();
      router.push(`/${params.storeId}/collections`);
      toast.success("Збірка видалена.");
    } catch (error) {
      toast.error("Переконайтесь що всі товари даної збірки видалені.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
         
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Назва</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Назва збірки"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Значення</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Значення збірки"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
     
    </>
  );
};
